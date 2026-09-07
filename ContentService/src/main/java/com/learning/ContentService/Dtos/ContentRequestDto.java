package com.learning.ContentService.Dtos;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentRequestDto {

    @NotBlank(message = "Lesson Index is required")
    private String lessonIndex;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Duration is required")
    private Long duration;

    private MultipartFile file;

    // Support snake_case parameter from frontend/Postman
    public void setLesson_index(String lesson_index) {
        this.lessonIndex = lesson_index;
    }

    // Support legacy contents[0].* form-data bindings
    public void setContents(List<ContentRequestDto> contents) {
        if (contents != null && !contents.isEmpty()) {
            ContentRequestDto first = contents.get(0);
            if (this.lessonIndex == null || this.lessonIndex.isBlank()) {
                this.lessonIndex = first.getLessonIndex();
            }
            if (this.title == null || this.title.isBlank()) {
                this.title = first.getTitle();
            }
            if (this.description == null || this.description.isBlank()) {
                this.description = first.getDescription();
            }
            if (this.duration == null) {
                this.duration = first.getDuration();
            }
            if (this.file == null) {
                this.file = first.getFile();
            }
        }
    }

    // Support files or content field names
    public void setFiles(List<MultipartFile> files) {
        if (files != null && !files.isEmpty() && this.file == null) {
            this.file = files.get(0);
        }
    }

    public void setContent(List<MultipartFile> content) {
        if (content != null && !content.isEmpty() && this.file == null) {
            this.file = content.get(0);
        }
    }
}
