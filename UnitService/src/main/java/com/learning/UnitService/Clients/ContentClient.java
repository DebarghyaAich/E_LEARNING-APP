package com.learning.UnitService.Clients;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.learning.UnitService.Dtos.Content;

@FeignClient(name = "ContentService", url = "${contentservice.url:http://localhost:8083}")
public interface ContentClient {

    @GetMapping("/api/v1/content/unit/{unitId}")
    List<Content> getContentsByUnitId(@PathVariable("unitId") String unitId);

}
