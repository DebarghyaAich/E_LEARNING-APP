package com.learning.ContentService.Dtos;

import com.learning.ContentService.Entities.Content;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContentResponseDto {

    private boolean success;
    private String message;
    private Content content;
    
}
