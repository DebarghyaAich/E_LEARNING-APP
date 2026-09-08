package com.learning.InteractionService.Services;

import com.learning.InteractionService.Dtos.CommentRequestDto;
import com.learning.InteractionService.Dtos.CommentResponseDto;

public interface InteractionService {
    CommentResponseDto addComment(String contentId, String userId, String parentCommentId, CommentRequestDto comment);
}
