package com.learning.ContentService.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Dtos.ContentBatchResponseDto;
import com.learning.ContentService.Service.ContentUploadService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/content")
@Slf4j
public class ContentController {

    private final ContentUploadService contentUploadService;

    public ContentController(ContentUploadService contentUploadService) {
        this.contentUploadService = contentUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ContentBatchResponseDto> uploadContent(
            @RequestParam(name = "courseId", required = false) String courseIdParam,
            @RequestParam(name = "courseID", required = false) String courseIDParam,
            @RequestParam(name = "unitId", required = false) String unitIdParam,
            @RequestParam(name = "unitID", required = false) String unitIDParam,
            @ModelAttribute @Valid ContentBatchRequest request,
            @RequestParam(name = "files", required = false) List<MultipartFile> files) throws Exception {

        String courseId = (courseIdParam != null && !courseIdParam.isBlank()) ? courseIdParam : courseIDParam;
        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID is required as a request parameter");
        }

        String unitId = (unitIdParam != null && !unitIdParam.isBlank()) ? unitIdParam : unitIDParam;
        if (unitId == null || unitId.isBlank()) {
            throw new IllegalArgumentException("Unit ID is required as a request parameter");
        }

        ContentBatchResponseDto response = contentUploadService.uploadContents(courseId, unitId, request, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
