package com.learning.Clients;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.learning.Dtos.Unit;

/**
 * OpenFeign client for communicating with UnitService microservice.
 */
@FeignClient(name = "UnitService", url = "${unitservice.url:http://localhost:8084}", fallback = UnitClientFallback.class)
public interface UnitClient {

    @GetMapping("/api/v1/unit/course/{courseId}")
    List<Unit> getUnitsByCourseId(@PathVariable("courseId") String courseId);

}

