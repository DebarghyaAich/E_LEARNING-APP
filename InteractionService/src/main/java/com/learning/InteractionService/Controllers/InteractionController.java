package com.learning.InteractionService.Controllers;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.learning.InteractionService.Dtos.CommentRequestDto;
import com.learning.InteractionService.Dtos.CommentResponseDto;
import com.learning.InteractionService.Services.InteractionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/interaction")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getServiceStatus() {
        return ResponseEntity.ok(Map.of(
                "service", "InteractionService",
                "status", "UP",
                "port", 8085,
                "timestamp", Instant.now().toString(),
                "registeredWithEureka", true
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<CommentResponseDto> addComment(
            @RequestParam(required = true) String contentId,
            @RequestParam(required = true) String userId,
            @RequestParam(required = false) String parentCommentId,
            @RequestBody CommentRequestDto comment) {

        CommentResponseDto response = interactionService.addComment(contentId, userId, parentCommentId, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
