package com.learning.ContentService.Dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentBatchRequest {
    @NotNull(message = "Course Id is required")
    @NotBlank(message = "Course Id is required")
    private String courseId;

    @NotEmpty(message = "Contents are required")
    private List<ContentItemRequestDto> contents;
}
