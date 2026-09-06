package com.learning.ContentService.Service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CourseService", url = "${courseservice.url:http://localhost:8082}")
public interface CourseImplService {

    @GetMapping("/api/v1/course/exists/{courseId}")
    Boolean findCourseId(@PathVariable("courseId") String courseId);

    default Boolean findCourseById(String courseId) {
        return findCourseId(courseId);
    }
}
