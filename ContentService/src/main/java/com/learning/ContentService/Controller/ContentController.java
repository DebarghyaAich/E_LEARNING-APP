package com.learning.ContentService.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Service.ContentService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/content")
@Slf4j
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadContent(
            @ModelAttribute ContentBatchRequest request,
            @RequestParam(name = "videos", required = false) List<MultipartFile> videos,
            @RequestParam(name = "pdfs", required = false) List<MultipartFile> pdfs) {

        contentService.uploadContents(request, videos, pdfs);
        return ResponseEntity.ok("Content uploaded successfully");
    }

}
