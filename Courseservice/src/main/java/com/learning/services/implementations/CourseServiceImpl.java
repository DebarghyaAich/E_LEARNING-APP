package com.learning.services.implementations;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.Clients.ContentClient;
import com.learning.Clients.UnitClient;
import com.learning.Dtos.Content;
import com.learning.Dtos.CourseRequestDto;
import com.learning.Dtos.CourseResponseDto;
import com.learning.Dtos.Unit;
import com.learning.Entities.Course;
import com.learning.Repository.CourseRepository;
import com.learning.services.CourseService;
import com.learning.services.ThumbnailUpdate;
import com.learning.services.ThumbnailUpload;

@Service
public class CourseServiceImpl implements CourseService {
    private final CourseRepository courseRepository;

    private final ThumbnailUpload thumbnailUpload;

    private final ThumbnailUpdate thumbnailUpdate;

    private final UnitClient unitClient;

    private final ContentClient contentClient;

    public CourseServiceImpl(CourseRepository courseRepository, ThumbnailUpload thumbnailUpload,
            ThumbnailUpdate thumbnailUpdate, UnitClient unitClient, ContentClient contentClient) {
        this.courseRepository = courseRepository;
        this.thumbnailUpload = thumbnailUpload;
        this.thumbnailUpdate = thumbnailUpdate;
        this.unitClient = unitClient;
        this.contentClient = contentClient;
    }

    // create a course
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

    // get all of the courses that are available with units and contents
    @Override
    public List<CourseResponseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(course -> {
                    List<Unit> units = fetchUnitsForCourse(course.getCourseId());
                    return CourseResponseDto.builder()
                            .success(true)
                            .message("Courses fetched successfully")
                            .course(course)
                            .units(units)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // find a course by its id and get all units (with contents) inside it
    @Override
    public CourseResponseDto enterIntoCourse(String courseId) {
        if (!findCourseId(courseId)) {
            throw new RuntimeException("Course not found with id " + courseId);
        }
        Course course = courseRepository.findByCourseId(courseId);
        List<Unit> units = fetchUnitsForCourse(courseId);
        return CourseResponseDto.builder()
                .success(true)
                .message("Here is the list of units inside the course")
                .course(course)
                .units(units)
                .build();
    }


    private List<Unit> fetchUnitsForCourse(String courseId) {
        List<Unit> units = Collections.emptyList();
        try {
            List<Unit> fetchedUnits = unitClient.getUnitsByCourseId(courseId);
            if (fetchedUnits != null) {
                units = enrichUnitsWithContents(fetchedUnits);
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch units from UnitClient for courseId " + courseId + ": " + e.getMessage());
        }
        return units;
    }

    private List<Unit> enrichUnitsWithContents(List<Unit> units) {
        if (units == null) {
            return Collections.emptyList();
        }
        for (Unit unit : units) {
            if (unit.getContents() == null || unit.getContents().isEmpty()) {
                try {
                    List<Content> contents = contentClient.getContentsByUnitId(unit.getUnitId());
                    unit.setContents(contents != null ? contents : Collections.emptyList());
                } catch (Exception e) {
                    if (unit.getContents() == null) {
                        unit.setContents(Collections.emptyList());
                    }
                }
            }
        }
        return units;
    }

    // update a course
    @Override
    public CourseResponseDto updateCourse(String courseId, CourseRequestDto request, MultipartFile newThumbnail) {
        if (!findCourseId(courseId)) {
            throw new RuntimeException("Course not found with id " + courseId);
        }
        Course existing = courseRepository.findByCourseId(courseId);

        String thumbnailUrl = existing.getThumbnailUrl();
        if (newThumbnail != null && !newThumbnail.isEmpty()) {
            try {
                thumbnailUrl = thumbnailUpdate.update(existing.getCourseId(), newThumbnail, existing.getThumbnailUrl());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Course courseToUpdate = existing.toBuilder()
                .title(request.getTitle() != null ? request.getTitle() : existing.getTitle())
                .description(request.getDescription() != null ? request.getDescription() : existing.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : existing.getCategory())
                .courseLevel(request.getCourseLevel() != null ? request.getCourseLevel() : existing.getCourseLevel())
                .price(request.getPrice() > 0 ? request.getPrice() : existing.getPrice())
                .thumbnailUrl(thumbnailUrl)
                .build();

        Course updated = courseRepository.save(courseToUpdate);
        return CourseResponseDto.builder()
                .success(true)
                .message("Course updated successfully")
                .course(updated)
                .build();
    }

}
