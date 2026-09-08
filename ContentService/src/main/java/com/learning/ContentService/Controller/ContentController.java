package com.learning.ContentService.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.ContentService.Dtos.ContentRequestDto;
import com.learning.ContentService.Dtos.ContentResponseDto;
import com.learning.ContentService.Entities.Content;
import com.learning.ContentService.Service.ContentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
@Slf4j
public class ContentController {

    private final ContentService contentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // creaete a content
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentResponseDto> createContent(
            @RequestParam(name = "courseId", required = false) String courseIdParam,
            @RequestParam(name = "courseID", required = false) String courseIDParam,
            @RequestParam(name = "unitId", required = false) String unitIdParam,
            @RequestParam(name = "unitID", required = false) String unitIDParam,
            @ModelAttribute ContentRequestDto formRequest,
            @RequestParam(name = "request", required = false) String requestJson,
            @RequestParam(name = "data", required = false) String dataJson,
            @RequestParam(name = "file", required = false) MultipartFile file,
            @RequestParam(name = "files", required = false) List<MultipartFile> files,
            @RequestParam(name = "content", required = false) MultipartFile contentFile) throws Exception {

        ContentRequestDto request = formRequest != null ? formRequest : new ContentRequestDto();

        // If metadata was passed as a JSON string in "request" or "data" part
        String jsonPayload = (requestJson != null && !requestJson.isBlank()) ? requestJson
                : (dataJson != null && !dataJson.isBlank()) ? dataJson : null;

        if (jsonPayload != null) {
            try {
                ContentRequestDto parsed = objectMapper.readValue(jsonPayload, ContentRequestDto.class);
                if (request.getLessonIndex() == null)
                    request.setLessonIndex(parsed.getLessonIndex());
                if (request.getTitle() == null)
                    request.setTitle(parsed.getTitle());
                if (request.getDescription() == null)
                    request.setDescription(parsed.getDescription());
                if (request.getDuration() == null)
                    request.setDuration(parsed.getDuration());
            } catch (Exception e) {
                log.warn("Failed to parse JSON request part: {}", e.getMessage());
            }
        }

        // Validate courseId from request parameters
        String courseId = (courseIdParam != null && !courseIdParam.isBlank()) ? courseIdParam : courseIDParam;
        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID is required as a request parameter");
        }
        if (courseId.contains(",")) {
            courseId = courseId.split(",")[0].trim();
        }

        // Validate unitId from request parameters
        String unitId = (unitIdParam != null && !unitIdParam.isBlank()) ? unitIdParam : unitIDParam;
        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("Unit ID is required as a request parameter");
        }
        if (unitId.contains(",")) {
            unitId = unitId.split(",")[0].trim();
        }

        // Validate ContentRequestDto fields
        if (request.getLessonIndex() == null || request.getLessonIndex().isBlank()) {
            throw new IllegalArgumentException("lessonIndex: Lesson Index is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("title: Title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new IllegalArgumentException("description: Description is required");
        }
        if (request.getDuration() == null) {
            throw new IllegalArgumentException("duration: Duration is required");
        }

        // Resolve file from parameter aliases
        MultipartFile fileToUpload = file;
        if (fileToUpload == null || fileToUpload.isEmpty()) {
            if (files != null && !files.isEmpty()) {
                fileToUpload = files.get(0);
            } else if (contentFile != null && !contentFile.isEmpty()) {
                fileToUpload = contentFile;
            } else if (request.getFile() != null && !request.getFile().isEmpty()) {
                fileToUpload = request.getFile();
            }
        }

        if (fileToUpload == null || fileToUpload.isEmpty()) {
            throw new IllegalArgumentException("Content file is required");
        }

        ContentResponseDto response = contentService.createContent(courseId, unitId, request, fileToUpload);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentResponseDto> uploadContent(
            @RequestParam(name = "courseId", required = false) String courseIdParam,
            @RequestParam(name = "courseID", required = false) String courseIDParam,
            @RequestParam(name = "unitId", required = false) String unitIdParam,
            @RequestParam(name = "unitID", required = false) String unitIDParam,
            @ModelAttribute ContentRequestDto request,
            @RequestParam(name = "request", required = false) String requestJson,
            @RequestParam(name = "data", required = false) String dataJson,
            @RequestParam(name = "file", required = false) MultipartFile file,
            @RequestParam(name = "files", required = false) List<MultipartFile> files,
            @RequestParam(name = "content", required = false) MultipartFile contentFile) throws Exception {

        return createContent(courseIdParam, courseIDParam, unitIdParam, unitIDParam, request, requestJson, dataJson,
                file, files, contentFile);
    }

    // Read contents by unitId
    @GetMapping({ "/unit/{unitId}", "/unit/view/{unitId}", "/unit/{unitId}/contents" })
    public ResponseEntity<List<Content>> getContentsByUnitId(@PathVariable String unitId) {
        if (unitId != null && unitId.contains(",")) {
            unitId = unitId.split(",")[0].trim();
        }
        List<Content> response = contentService.getContentsByUnitId(unitId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Read all contents by courseId
    @GetMapping({ "/course/{courseId}", "/course/view/{courseId}", "/course/{courseId}/contents" })
    public ResponseEntity<List<Content>> getContentsByCourseId(@PathVariable String courseId) {
        if (courseId != null && courseId.contains(",")) {
            courseId = courseId.split(",")[0].trim();
        }
        List<Content> response = contentService.getContentsByCourseId(courseId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> contentExists(@RequestParam String contentId) {
        if (contentId == null || contentId.isBlank()) {
            throw new IllegalArgumentException("Content ID is required to check existence");
        }
        boolean exists = contentService.contentExists(contentId);
        return ResponseEntity.status(HttpStatus.OK).body(exists);
    }

}
