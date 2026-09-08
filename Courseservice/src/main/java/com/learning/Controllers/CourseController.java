package com.learning.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.Dtos.Unit;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.learning.services.CourseService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Creating New Course
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

    // read all of the course
    @GetMapping("/course/list")
    public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
        List<CourseResponseDto> response = courseService.getAllCourses();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // click the view and read the units inside course
    @GetMapping({"/course/view/{courseId}", "/course/{courseId}"})
    public ResponseEntity<CourseResponseDto> enterIntoCourse(@PathVariable String courseId) {
        CourseResponseDto response = courseService.enterIntoCourse(courseId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Read all units by course ID (returns list of units enriched with contents)
    @GetMapping({"/course/{courseId}/units", "/course/units/{courseId}"})
    public ResponseEntity<List<Unit>> getUnitsByCourseId(@PathVariable String courseId) {
        List<Unit> units = courseService.getUnitsByCourseId(courseId);
        return ResponseEntity.status(HttpStatus.OK).body(units);
    }

    // Update the Course
    @PutMapping(value = "/course/update/{courseId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CourseResponseDto> updateCourse(
            @PathVariable String courseId,
            @ModelAttribute @Valid CourseRequestDto request,
            @RequestParam(required = false, name = "thumbnail") MultipartFile thumbnail) throws Exception {
        CourseResponseDto response = courseService.updateCourse(courseId, request, thumbnail);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/course/exists/{courseId}")
    public Boolean findCourseId(@PathVariable String courseId) {
        return courseService.findCourseId(courseId);
    }
}
