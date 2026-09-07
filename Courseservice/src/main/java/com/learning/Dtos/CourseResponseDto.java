package com.learning.Dtos;

import java.util.List;

import com.learning.Entities.Course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDto {
    private boolean success;
    private String message;
    private Course course;
    private List<Unit> units;

}

