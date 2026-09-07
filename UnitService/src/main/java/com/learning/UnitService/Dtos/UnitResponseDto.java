package com.learning.UnitService.Dtos;

import java.util.List;

import com.learning.UnitService.Entities.Unit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data 
@AllArgsConstructor 
@NoArgsConstructor 
@Builder 
public class UnitResponseDto {

    private boolean success;
    private String message;
    private Unit unit;
    private Integer unitIndex;
    private String title;
    private String description;
    private List<Content> contents;

}
