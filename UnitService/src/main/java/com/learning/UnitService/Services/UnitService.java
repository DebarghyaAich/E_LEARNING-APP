package com.learning.UnitService.Services;

import java.util.List;

import com.learning.UnitService.Dtos.UnitRequestDto;
import com.learning.UnitService.Dtos.UnitResponseDto;
import com.learning.UnitService.Entities.Unit;

public interface UnitService {

    UnitResponseDto createUnit(UnitRequestDto request, String courseId);

    Boolean unitExists(String unitId);

    List<Unit> getUnitsByCourseId(String courseId);
}
