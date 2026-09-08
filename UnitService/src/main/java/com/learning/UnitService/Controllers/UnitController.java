package com.learning.UnitService.Controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.UnitService.Dtos.UnitRequestDto;
import com.learning.UnitService.Dtos.UnitResponseDto;
import com.learning.UnitService.Entities.Unit;
import com.learning.UnitService.Services.UnitService;

import org.springframework.web.bind.annotation.CrossOrigin;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/unit")
@RequiredArgsConstructor
@Slf4j
public class UnitController {

    private final UnitService unitService;
    private final ObjectMapper objectMapper;

    // creating a new unit via JSON
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UnitResponseDto> createUnitJson(
            @RequestParam(required = false, name = "courseId") String courseId,
            @RequestParam(required = false, name = "courseID") String courseID,
            @RequestBody @Valid UnitRequestDto request) {

        String resolvedCourseId = resolveCourseId(courseId, courseID, request);
        UnitResponseDto response = unitService.createUnit(request, resolvedCourseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // creating a new unit via multipart / form-data / urlencoded
    @PostMapping(
            value = "/create",
            consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE }
    )
    public ResponseEntity<UnitResponseDto> createUnitFormData(
            @RequestParam(required = false, name = "courseId") String courseId,
            @RequestParam(required = false, name = "courseID") String courseID,
            @ModelAttribute UnitRequestDto formRequest,
            @RequestParam(name = "request", required = false) String requestJson,
            @RequestParam(name = "data", required = false) String dataJson) {

        UnitRequestDto request = formRequest != null ? formRequest : new UnitRequestDto();
        String jsonPayload = (requestJson != null && !requestJson.isBlank()) ? requestJson
                : (dataJson != null && !dataJson.isBlank()) ? dataJson : null;
        if (jsonPayload != null) {
            try {
                UnitRequestDto parsed = objectMapper.readValue(jsonPayload, UnitRequestDto.class);
                if (request.getTitle() == null) request.setTitle(parsed.getTitle());
                if (request.getDescription() == null) request.setDescription(parsed.getDescription());
                if (request.getCourseId() == null) request.setCourseId(parsed.getCourseId());
            } catch (Exception e) {
                log.warn("Failed to parse JSON request part: {}", e.getMessage());
            }
        }

        String resolvedCourseId = resolveCourseId(courseId, courseID, request);
        UnitResponseDto response = unitService.createUnit(request, resolvedCourseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String resolveCourseId(String courseId, String courseID, UnitRequestDto request) {
        if (courseId != null && !courseId.isBlank()) {
            return courseId.trim();
        }
        if (courseID != null && !courseID.isBlank()) {
            return courseID.trim();
        }
        if (request != null && request.getCourseId() != null && !request.getCourseId().isBlank()) {
            return request.getCourseId().trim();
        }
        return null;
    }

    // find unit by unit id
    @GetMapping("/exists/{unitId}")
    public Boolean unitExists(@PathVariable String unitId) {
        return unitService.unitExists(unitId);
    }

    // get all unit by courseID
    @GetMapping({"/course/{courseId}", "/course/view/{courseId}", "/course/{courseId}/units", "/course/units/{courseId}"})
    public ResponseEntity<List<Unit>> getUnitsByCourseId(@PathVariable String courseId) {
        return ResponseEntity.ok(unitService.getUnitsByCourseId(courseId));
    }
}
