package com.learning.InteractionService.Services.Implementations;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learning.InteractionService.Clients.ContentClient;
import com.learning.InteractionService.Dtos.CommentRequestDto;
import com.learning.InteractionService.Dtos.CommentResponseDto;
import com.learning.InteractionService.Entities.Comment;
import com.learning.InteractionService.Repositories.CommentRepository;
import com.learning.InteractionService.Services.InteractionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InteractionServiceImpl implements InteractionService {

    private final CommentRepository commentRepository;
    private final ContentClient contentClient;

    @Override
    @Transactional
    public CommentResponseDto addComment(String contentId, String userId, String parentCommentId, CommentRequestDto comment) {

        if (contentId == null || contentId.isBlank()) {
            throw new IllegalArgumentException("Content ID is required to add a comment");
        }
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID is required to add a comment");
        }
        if (comment == null || comment.getCommentText() == null || comment.getCommentText().isBlank()) {
            throw new IllegalArgumentException("Comment text is required to add a comment");
        }
        if (Boolean.FALSE.equals(contentClient.contentExists(contentId.trim()))) {
            throw new IllegalArgumentException("Content not found with id " + contentId);
        }

        Comment newComment = Comment.builder()
                .contentId(contentId.trim())
                .userId(userId.trim())
                .parentCommentId(parentCommentId != null && !parentCommentId.isBlank() ? parentCommentId.trim() : null)
                .commentText(comment.getCommentText().trim())
                .build();

        Comment savedComment = commentRepository.save(newComment);
        log.info("Successfully added comment with id: {}", savedComment.getCommentId());

        return CommentResponseDto.builder()
                .commentId(savedComment.getCommentId())
                .contentId(savedComment.getContentId())
                .userId(savedComment.getUserId())
                .commentText(savedComment.getCommentText())
                .parentCommentId(savedComment.getParentCommentId())
                .createdAt(savedComment.getCreatedAt())
                .updatedAt(savedComment.getUpdatedAt())
                .build();
    }

}
