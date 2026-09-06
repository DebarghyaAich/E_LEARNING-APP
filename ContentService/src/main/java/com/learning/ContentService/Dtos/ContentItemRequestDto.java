package com.learning.ContentService.Dtos;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.multipart.MultipartFile;

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

    @NotNull(message = "Duration is required")
    private Long duration;

    private MultipartFile file;

    private List<MultipartFile> content;

    public void setContent(List<MultipartFile> content) {
        this.content = content;
        if (content != null && !content.isEmpty()) {
            this.file = content.get(0);
        }
    }

    public void setFile(MultipartFile file) {
        this.file = file;
        if (file != null) {
            this.content = List.of(file);
        }
    }
}
