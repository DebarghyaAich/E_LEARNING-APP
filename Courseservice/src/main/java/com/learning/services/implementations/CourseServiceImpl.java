package com.learning.services.implementations;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.Entities.Course;
import com.learning.Repository.CourseRepository;
import com.learning.services.CourseService;
import com.learning.services.ThumbnailUpload;

@Service
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;

    private final ThumbnailUpload thumbnailUpload;

    public CourseServiceImpl(CourseRepository courseRepository, ThumbnailUpload thumbnailUpload) {
        this.courseRepository = courseRepository;
        this.thumbnailUpload = thumbnailUpload;
    }

    @Override
    public CourseResponseDto createCourse(CourseRequestDto request, MultipartFile thumbnail) {
        String thumbnailUri = null;
        if (thumbnail != null && !thumbnail.isEmpty()) {
            thumbnailUri = thumbnailUpload.upload(thumbnail);
        }

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .courseLevel(request.getCourseLevel())
                .price(request.getPrice())
                .thumbnailUrl(thumbnailUri)
                .build();
        Course saved = courseRepository.save(course);

        return CourseResponseDto.builder()
                .success(true)
                .message("Course created successfully")
                .course(saved)
                .build();
    }

    @Override
    public Boolean findCourseId(String courseId) {
        return courseRepository.existsByCourseId(courseId);
    }

}
