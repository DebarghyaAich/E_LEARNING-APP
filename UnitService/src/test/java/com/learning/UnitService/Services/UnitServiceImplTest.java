package com.learning.UnitService.Services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.learning.UnitService.Clients.CourseClient;
import com.learning.UnitService.Dtos.UnitRequestDto;
import com.learning.UnitService.Dtos.UnitResponseDto;
import com.learning.UnitService.Entities.Unit;
import com.learning.UnitService.Repositories.UnitRepository;
import com.learning.UnitService.Services.Implementations.UnitServiceImpl;

@ExtendWith(MockitoExtension.class)
class UnitServiceImplTest {

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private CourseClient courseClient;

    private UnitServiceImpl unitService;

    @BeforeEach
    void setUp() {
        unitService = new UnitServiceImpl(unitRepository, courseClient);
    }

    @Test
    void testCreateUnit_Success() {
        String courseId = "course-123";
        when(courseClient.checkCourseExists(courseId)).thenReturn(true);
        when(unitRepository.findByCourseIdAndUnitIndex(courseId, 1)).thenReturn(Optional.empty());

        UnitRequestDto request = UnitRequestDto.builder()
                .title("Unit 1: Introduction")
                .description("Basics of the course")
                .build();

        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> {
            Unit u = invocation.getArgument(0);
            u.setUnitId("unit-uuid-1");
            return u;
        });

        UnitResponseDto response = unitService.createUnit(request, courseId);

        assertTrue(response.isSuccess());
        assertEquals("Unit created successfully", response.getMessage());
        assertNotNull(response.getUnit());
        assertEquals("unit-uuid-1", response.getUnit().getUnitId());
        assertEquals(courseId, response.getUnit().getCourseId());
        assertEquals("Unit 1: Introduction", response.getUnit().getTitle());
        assertEquals(1, response.getUnit().getUnitIndex());

        ArgumentCaptor<Unit> captor = ArgumentCaptor.forClass(Unit.class);
        verify(unitRepository).save(captor.capture());
        assertEquals(courseId, captor.getValue().getCourseId());
    }

    @Test
    void testCreateUnit_AutoAssignUnitIndex() {
        String courseId = "course-123";
        when(courseClient.checkCourseExists(courseId)).thenReturn(true);
        when(unitRepository.countByCourseId(courseId)).thenReturn(2L);

        UnitRequestDto request = UnitRequestDto.builder()
                .title("Unit Next")
                .description("Auto indexed")
                .build();

        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UnitResponseDto response = unitService.createUnit(request, courseId);

        assertNotNull(response.getUnit());
        assertEquals(3, response.getUnit().getUnitIndex());
    }

    @Test
    void testCreateUnit_CourseNotFound_ThrowsException() {
        String courseId = "invalid-course";
        when(courseClient.checkCourseExists(courseId)).thenReturn(false);

        UnitRequestDto request = UnitRequestDto.builder()
                .title("Unit 1")
                .build();

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                unitService.createUnit(request, courseId)
        );

        assertEquals("Course not found with id invalid-course", exception.getMessage());
    }

    @Test
    void testCreateUnit_AutoIncrement_WhenIndexCollisionExists() {
        String courseId = "course-123";
        when(courseClient.checkCourseExists(courseId)).thenReturn(true);
        when(unitRepository.countByCourseId(courseId)).thenReturn(1L);
        when(unitRepository.findByCourseIdAndUnitIndex(courseId, 2))
                .thenReturn(Optional.of(Unit.builder().unitId("existing").build()));
        when(unitRepository.findByCourseIdAndUnitIndex(courseId, 3))
                .thenReturn(Optional.empty());

        UnitRequestDto request = UnitRequestDto.builder()
                .title("Unit Next")
                .build();

        when(unitRepository.save(any(Unit.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UnitResponseDto response = unitService.createUnit(request, courseId);

        assertNotNull(response.getUnit());
        assertEquals(3, response.getUnit().getUnitIndex());
    }

    @Test
    void testUnitExists() {
        when(unitRepository.existsByUnitId("unit-123")).thenReturn(true);
        when(unitRepository.existsByUnitId("unit-999")).thenReturn(false);

        assertTrue(unitService.unitExists("unit-123"));
        assertEquals(false, unitService.unitExists("unit-999"));
        assertEquals(false, unitService.unitExists(""));
        assertEquals(false, unitService.unitExists(null));
    }

}
