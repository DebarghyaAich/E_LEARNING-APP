package com.learning.UnitService.Services.Implementations;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learning.UnitService.Clients.ContentClient;
import com.learning.UnitService.Clients.CourseClient;
import com.learning.UnitService.Dtos.Content;
import com.learning.UnitService.Dtos.UnitRequestDto;
import com.learning.UnitService.Dtos.UnitResponseDto;
import com.learning.UnitService.Entities.Unit;
import com.learning.UnitService.Repositories.UnitRepository;
import com.learning.UnitService.Services.UnitService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UnitServiceImpl implements UnitService {

    private final UnitRepository unitRepository;
    private final CourseClient courseClient;
    private final ContentClient contentClient;

    // Creating a unit under a course (by courseId)
    @Override
    @Transactional
    public UnitResponseDto createUnit(UnitRequestDto request, String courseId) {
        if (request == null) {
            throw new IllegalArgumentException("Unit request cannot be null");
        }

        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID is required to create a unit");
        }
        courseId = courseId.trim();

        log.info("Creating unit for courseId: {}", courseId);

        // 1. Verify course existence
        Boolean courseExists;
        try {
            courseExists = courseClient.checkCourseExists(courseId);
        } catch (Exception e) {
            log.error("Failed to verify course existence with CourseService: {}", e.getMessage());
            throw new RuntimeException("Unable to verify course existence with id " + courseId + ": " + e.getMessage());
        }

        if (!Boolean.TRUE.equals(courseExists)) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        // 2. Auto-increment unitIndex
        int unitIndex = (int) unitRepository.countByCourseId(courseId) + 1;
        while (unitRepository.findByCourseIdAndUnitIndex(courseId, unitIndex).isPresent()) {
            unitIndex++;
        }

        // 3. Build and persist Unit entity
        Unit unit = Unit.builder()
                .courseId(courseId)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .unitIndex(unitIndex)
                .build();

        Unit savedUnit = unitRepository.save(unit);

        log.info("Unit successfully created with unitId: {} for courseId: {}", savedUnit.getUnitId(), courseId);

        return UnitResponseDto.builder()
                .success(true)
                .message("Unit created successfully")
                .unit(savedUnit)
                .build();
    }

    @Override
    public Boolean unitExists(String unitId) {
        if (unitId == null || unitId.isBlank()) {
            return false;
        }
        return unitRepository.existsByUnitId(unitId.trim());
    }

    @Override
    public List<Unit> getUnitsByCourseId(String courseId) {
        if (courseId == null || courseId.isBlank()) {
            throw new IllegalArgumentException("Course ID is required");
        }
        if (courseId.contains(",")) {
            courseId = courseId.split(",")[0].trim();
        }
        courseId = courseId.trim();

        if ("{courseId}".equalsIgnoreCase(courseId)) {
            throw new RuntimeException("Invalid course ID: '{courseId}'. Please provide a valid course UUID.");
        }

        List<Unit> units = unitRepository.findByCourseIdOrderByUnitIndexAsc(courseId);
        if (units != null) {
            for (Unit unit : units) {
                if (unit.getContents() == null || unit.getContents().isEmpty()) {
                    try {
                        List<Content> contents = contentClient.getContentsByUnitId(unit.getUnitId());
                        unit.setContents(contents != null ? contents : Collections.emptyList());
                    } catch (Exception e) {
                        if (unit.getContents() == null) {
                            unit.setContents(Collections.emptyList());
                        }
                    }
                }
            }
        }
        return units != null ? units : Collections.emptyList();
    }

}
