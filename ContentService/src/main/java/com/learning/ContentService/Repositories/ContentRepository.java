package com.learning.ContentService.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.ContentService.Entities.Content;

@Repository
public interface ContentRepository extends JpaRepository<Content, String> {
    
}
