package com.learning.ContentService.Service.Implementation;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentRequestDto;
import com.learning.ContentService.Dtos.ContentResponseDto;
import com.learning.ContentService.Entities.Content;
import com.learning.ContentService.Repositories.ContentRepository;
import com.learning.ContentService.Service.ContentFileUploadService;
import com.learning.ContentService.Service.ContentService;
import com.learning.ContentService.Service.CourseImplService;
import com.learning.ContentService.Service.UnitImplService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final CourseImplService courseImplService;
    private final UnitImplService unitImplService;
    private final ContentFileUploadService contentFileUploadService;

    @Override
    @Transactional
    public ContentResponseDto createContent(
            String courseId,
            String unitId,
            ContentRequestDto request,
            MultipartFile file) throws Exception {

        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID is required");
        }
        courseId = courseId.trim();

        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        unitId = unitId.trim();

        if (request == null) {
            throw new IllegalArgumentException("Content request body is required");
        }

        MultipartFile fileToUpload = (file != null && !file.isEmpty()) ? file : request.getFile();
        if (fileToUpload == null || fileToUpload.isEmpty()) {
            throw new IllegalArgumentException("Content file is required");
        }

        log.info("Creating content for courseId: {}, unitId: {}, title: {}", courseId, unitId, request.getTitle());

        // 1. Verify course existence
        if (!Boolean.TRUE.equals(courseImplService.findCourseId(courseId))) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        // 2. Verify unit existence
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

        // 3. Upload file to MinIO
        String uploadedUrl = contentFileUploadService.uploadContent(
                fileToUpload,
                courseId,
                request.getLessonIndex());

        // 4. Persist Content entity
        Content content = Content.builder()
                .courseId(courseId)
                .unitId(unitId)
                .lessonIndex(request.getLessonIndex() != null ? request.getLessonIndex().trim() : "1")
                .title(request.getTitle() != null ? request.getTitle().trim() : "")
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .duration(request.getDuration() != null ? request.getDuration() : 0L)
                .contentUrl(uploadedUrl)
                .build();

        Content savedContent = contentRepository.save(content);

        log.info("Successfully created content with id: {}", savedContent.getContentId());

        return ContentResponseDto.builder()
                .success(true)
                .message("Content created successfully")
                .content(savedContent)
                .build();
    }

    @Override
    public List<Content> getContentsByUnitId(String unitId) {
        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("Unit ID is required");
        }
        return contentRepository.findByUnitIdOrderByLessonIndexAsc(unitId.trim());
    }
}
