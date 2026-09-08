package com.learning.InteractionService.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.InteractionService.Entities.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {
}
