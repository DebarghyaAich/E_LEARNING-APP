package com.learning.services.implementations;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.Entities.Course;
import com.learning.Entities.ThumbnailType;
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
        ThumbnailType type = request.getThumbnailType();
        if (type == null && thumbnail != null && !thumbnail.isEmpty()) {
            try {
                type = thumbnailUpload.detectThumbnailType(thumbnail);
            } catch (Exception ignored) {
                type = ThumbnailType.IMAGE;
            }
        }
        if (type == null) {
            type = ThumbnailType.IMAGE;
        }

        String thumbnailUri = thumbnailUpload.upload(thumbnail, type);
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .thumbnailType(type)
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
        return courseRepository.existsByCourseID(courseId);
    }

}
