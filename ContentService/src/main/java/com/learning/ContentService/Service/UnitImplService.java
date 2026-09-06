package com.learning.ContentService.Service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "UnitService", url = "${unitservice.url:http://localhost:8084}")
public interface UnitImplService {

    @GetMapping("/api/v1/unit/exists/{unitId}")
    Boolean unitExists(@PathVariable("unitId") String unitId);

    default Boolean findUnitId(String unitId) {
        return unitExists(unitId);
    }
}
