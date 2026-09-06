package com.learning.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.Entities.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    Boolean existsByCourseID(String courseId);

}
