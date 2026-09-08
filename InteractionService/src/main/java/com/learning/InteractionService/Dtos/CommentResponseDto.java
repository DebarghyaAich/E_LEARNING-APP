package com.learning.InteractionService.Dtos;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponseDto {
    private String commentId;
    private String contentId;
    private String userId;
    private String commentText;
    private String parentCommentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
