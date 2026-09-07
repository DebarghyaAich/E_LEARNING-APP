package com.learning.ContentService.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.ContentService.Entities.Content;

import java.util.List;

@Repository
public interface ContentRepository extends JpaRepository<Content, String> {

    List<Content> findByUnitId(String unitId);

    List<Content> findByUnitIdOrderByLessonIndexAsc(String unitId);

    List<Content> findByCourseId(String courseId);

}
