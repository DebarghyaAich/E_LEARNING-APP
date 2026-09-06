package com.learning.ContentService.Service.Implementation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Dtos.ContentBatchResponseDto;
import com.learning.ContentService.Dtos.ContentItemRequestDto;
import com.learning.ContentService.Entities.Content;
import com.learning.ContentService.Entities.ContentType;
import com.learning.ContentService.Repositories.ContentRepository;
import com.learning.ContentService.Service.ContentFileUploadService;
import com.learning.ContentService.Service.ContentUploadService;
import com.learning.ContentService.Service.CourseImplService;
import com.learning.ContentService.Service.UnitImplService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentBatchUploadServiceImpl implements ContentUploadService {

        private final ContentRepository contentRepository;
        private final CourseImplService courseImplService;
        private final ContentFileUploadService contentFileUploadService;
        private final UnitImplService unitImplService;

        @Override
        @Transactional
        public ContentBatchResponseDto uploadContents(
                        String courseId,
                        String unitId,
                        ContentBatchRequest request,
                        List<MultipartFile> files) throws Exception {

                if (courseId == null || courseId.isBlank()) {
                        throw new IllegalArgumentException("Course ID is required");
                }
                courseId = courseId.trim();

                if (unitId == null || unitId.isBlank()) {
                        throw new IllegalArgumentException("Unit ID is required");
                }
                unitId = unitId.trim();

                log.info(
                                "Starting batch content upload for courseId: {}, unitId: {}",
                                courseId,
                                unitId);

                // ---------------------------------------------------------
                // 1. Verify course existence
                // ---------------------------------------------------------

                if (!Boolean.TRUE.equals(
                                courseImplService.findCourseId(courseId))) {

                        throw new RuntimeException(
                                        "Course not found with id " + courseId);
                }

                // ---------------------------------------------------------
                // 2. Verify unit existence
                // ---------------------------------------------------------

                if (unitImplService != null) {
                        try {
                                Boolean unitExists = unitImplService.unitExists(unitId);
                                if (Boolean.FALSE.equals(unitExists)) {
                                        throw new RuntimeException("Unit not found with id " + unitId);
                                }
                        } catch (Exception e) {
                                if (e.getMessage() != null && e.getMessage().contains("Unit not found")) {
                                        throw e;
                                }
                                log.warn("Unable to verify unit existence with UnitService: {}", e.getMessage());
                        }
                }

                // ---------------------------------------------------------
                // 3. Validate content list
                // ---------------------------------------------------------

                if (request.getContents() == null
                                || request.getContents().isEmpty()) {

                        throw new RuntimeException(
                                        "Content items list cannot be empty");
                }

                // ---------------------------------------------------------
                // 4. Validate lesson indices
                // ---------------------------------------------------------

                Set<String> seenIndices = new HashSet<>();

                for (ContentItemRequestDto item : request.getContents()) {

                        String lessonIndex = item.getLessonIndex();

                        if (lessonIndex == null || lessonIndex.isBlank()) {

                                throw new RuntimeException(
                                                "Invalid lesson index for item: "
                                                                + item.getTitle());
                        }

                        lessonIndex = lessonIndex.trim();

                        /*
                         * Check duplicate lesson index in request.
                         *
                         * Example:
                         *
                         * 01
                         * 02
                         * 03
                         *
                         * is valid.
                         *
                         * 01
                         * 02
                         * 01
                         *
                         * is invalid.
                         */
                        if (!seenIndices.add(lessonIndex)) {

                                throw new RuntimeException(
                                                "Duplicate lesson index detected in content batch: "
                                                                + lessonIndex);
                        }

                        // Store trimmed value back into DTO
                        item.setLessonIndex(lessonIndex);
                }

                // ---------------------------------------------------------
                // 4. Index uploaded files
                //
                // Key: normalized lesson index
                // ---------------------------------------------------------

                Map<String, MultipartFile> fileMap = new HashMap<>();

                if (files != null && !files.isEmpty()) {

                        for (MultipartFile file : files) {

                                if (file == null || file.isEmpty()) {
                                        continue;
                                }

                                // ---------------------------------------------
                                // Extract lesson index from filename
                                // ---------------------------------------------

                                String lectureNumber = contentFileUploadService.extractLectureNumber(
                                                file.getOriginalFilename());

                                if (lectureNumber == null
                                                || lectureNumber.isBlank()) {

                                        throw new RuntimeException(
                                                        "Could not extract lecture number from file: "
                                                                        + file.getOriginalFilename());
                                }

                                lectureNumber = lectureNumber.trim();

                                // ---------------------------------------------
                                // Validate content type
                                // ---------------------------------------------

                                ContentType detectedType = contentFileUploadService.detectContentType(file);

                                if (detectedType == ContentType.NONE) {

                                        throw new RuntimeException(
                                                        "Unsupported file type: "
                                                                        + file.getOriginalFilename());
                                }

                                // ---------------------------------------------
                                // Check duplicate lecture number
                                // ---------------------------------------------

                                String normKey = normalizeIndex(lectureNumber);

                                if (fileMap.containsKey(normKey)) {

                                        throw new RuntimeException(
                                                        "Duplicate file found for lecture number: "
                                                                        + lectureNumber
                                                                        + " - "
                                                                        + file.getOriginalFilename());
                                }

                                // ---------------------------------------------
                                // Store file in map
                                // ---------------------------------------------

                                fileMap.put(normKey, file);
                                fileMap.put(lectureNumber, file);
                        }
                }

                // ---------------------------------------------------------
                // 5. Match request items with uploaded files
                // ---------------------------------------------------------

                List<Content> contents = new ArrayList<>();

                for (ContentItemRequestDto item : request.getContents()) {

                        String lessonIndex = item.getLessonIndex();
                        String normIndex = normalizeIndex(lessonIndex);

                        MultipartFile matchedFile = null;

                        if (item.getFile() != null && !item.getFile().isEmpty()) {
                                matchedFile = item.getFile();
                        } else {
                                matchedFile = fileMap.get(normIndex);
                                if (matchedFile == null) {
                                        matchedFile = fileMap.get(lessonIndex);
                                }
                        }

                        String uploadedUrl = null;

                        if (matchedFile != null) {

                                // Set file on DTO
                                item.setFile(matchedFile);

                                // Upload to MinIO
                                uploadedUrl = contentFileUploadService.uploadContent(
                                                matchedFile,
                                                courseId);

                        } else {

                                throw new RuntimeException(
                                                "No matching file found for lesson index "
                                                                + lessonIndex
                                                                + " ("
                                                                + item.getTitle()
                                                                + ")");
                        }

                        // ---------------------------------------------
                        // Build Content entity
                        // ---------------------------------------------

                        Content content = Content.builder()
                                        .courseId(courseId)
                                        .unitId(unitId)
                                        .lessonIndex(lessonIndex)
                                        .title(item.getTitle())
                                        .description(item.getDescription())
                                        .duration(item.getDuration())
                                        .contentUrl(uploadedUrl)
                                        .build();

                        contents.add(content);
                }

                // ---------------------------------------------------------
                // 6. Save all content entities
                // ---------------------------------------------------------

                List<Content> savedContents = contentRepository.saveAll(contents);

                log.info(
                                "Successfully persisted {} contents for courseId: {}",
                                savedContents.size(),
                                courseId);
                
                // ---------------------------------------------------------
                // 7. Return response
                // ---------------------------------------------------------

                return ContentBatchResponseDto.builder()
                                .success(true)
                                .message("Content uploaded successfully")
                                .contents(savedContents)
                                .build();
        }

        private String normalizeIndex(String index) {
                if (index == null) {
                        return "";
                }
                String trimmed = index.trim();
                try {
                        return String.valueOf(Long.parseLong(trimmed));
                } catch (NumberFormatException e) {
                        return trimmed.toLowerCase(Locale.ROOT);
                }
        }
}