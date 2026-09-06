package com.learning.ContentService.Dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Entities.ContentType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContentItemRequestDto {

    @NotBlank(message = "Lesson Index is required")
    private String lessonIndex;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Content Type is required")
    private ContentType contentType;

    @NotNull(message = "Duration is required")
    private Long duration;

    private MultipartFile file;

}
