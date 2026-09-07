package com.learning.Dtos;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {

    private String unitId;
    private String courseId;
    private String title;
    private String description;
    private Integer unitIndex;
    private String contentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Content> contents;

}
