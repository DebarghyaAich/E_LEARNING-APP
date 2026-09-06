package com.learning.services;

import org.springframework.web.multipart.MultipartFile;

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;

public interface CourseService {

    CourseResponseDto createCourse(CourseRequestDto request, MultipartFile thumbnail);

    Boolean findCourseId(String courseId);

}
