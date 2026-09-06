package com.learning.UnitService.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "CourseService", url = "${courseservice.url:http://localhost:8082}")
public interface CourseClient {

    @GetMapping("/api/v1/course/exists/{courseId}")
    Boolean checkCourseExists(@PathVariable("courseId") String courseId);

}
