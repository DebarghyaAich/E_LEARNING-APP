package com.learning.Controllers;

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

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.services.CourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping(value = "/course/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseResponseDto> createCourse(
            @ModelAttribute @Valid CourseRequestDto request,
            @RequestParam(required = false, name = "thumbnail") MultipartFile thumbnail) {

        MultipartFile fileToUpload = (thumbnail != null && !thumbnail.isEmpty()) ? thumbnail
                : request.getThumbnail();

        if (fileToUpload == null || fileToUpload.isEmpty()) {
            throw new RuntimeException("Thumbnail file is required");
        }

        CourseResponseDto response = courseService.createCourse(request, fileToUpload);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/course/exists/{courseId}")
    public Boolean findCourseId(@PathVariable String courseId) {
        return courseService.findCourseId(courseId);
    }
}
