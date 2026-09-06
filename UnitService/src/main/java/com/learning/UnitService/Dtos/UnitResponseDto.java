package com.learning.UnitService.Dtos;

import com.learning.UnitService.Entities.Unit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitResponseDto {

    private boolean success;

    private String message;

    private Unit unit;

}
