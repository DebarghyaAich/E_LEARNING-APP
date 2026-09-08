package com.learning.services;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.Dtos.Unit;

public interface CourseService {

    CourseResponseDto createCourse(CourseRequestDto request, MultipartFile thumbnail);

    Boolean findCourseId(String courseId);

    CourseResponseDto enterIntoCourse(String courseId);

    List<Unit> getUnitsByCourseId(String courseId);

    CourseResponseDto updateCourse(String courseId, CourseRequestDto request, MultipartFile thumbnail);

    List<CourseResponseDto> getAllCourses();
}
