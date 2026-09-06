package com.learning.UnitService.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learning.UnitService.Dtos.UnitRequestDto;
import com.learning.UnitService.Dtos.UnitResponseDto;
import com.learning.UnitService.Entities.Unit;
import com.learning.UnitService.Services.UnitService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/unit")
@RequiredArgsConstructor
public class UnitController {

    private final UnitService unitService;

    @PostMapping("/create")
    public ResponseEntity<UnitResponseDto> createUnit(
            @RequestParam(required = false, name = "courseId") String courseId,
            @RequestBody @Valid UnitRequestDto request) {

        UnitResponseDto response = unitService.createUnit(request, courseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/exists/{unitId}")
    public Boolean unitExists(@PathVariable String unitId) {
        return unitService.unitExists(unitId);
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<Unit> getUnitById(@PathVariable String unitId) {
        return ResponseEntity.ok(unitService.getUnitById(unitId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Unit>> getUnitsByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(unitService.getUnitsByCourseId(courseId));
    }

}
