package com.learning.ContentService.Dtos;

import java.util.List;

import com.learning.ContentService.Entities.Content;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentBatchResponseDto {
    private Boolean success;
    private String message;
    private List<Content> contents;

}
