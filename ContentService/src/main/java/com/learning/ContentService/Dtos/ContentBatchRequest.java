package com.learning.ContentService.Dtos;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentBatchRequest {

    @NotEmpty(message = "Contents are required")
    private List<ContentItemRequestDto> contents;

    public List<ContentItemRequestDto> getContents() {
        return contents;
    }

    public void setContents(List<ContentItemRequestDto> contents) {
        this.contents = contents;
    }
}
