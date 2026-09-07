package com.learning.ContentService.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.learning.ContentService.Dtos.ContentRequestDto;
import com.learning.ContentService.Dtos.ContentResponseDto;
import com.learning.ContentService.Entities.Content;
import com.learning.ContentService.Repositories.ContentRepository;
import com.learning.ContentService.Service.Implementation.ContentServiceImpl;

@ExtendWith(MockitoExtension.class)
class ContentServiceImplTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private CourseImplService courseImplService;

    @Mock
    private UnitImplService unitImplService;

    @Mock
    private ContentFileUploadService contentFileUploadService;

    private ContentServiceImpl contentService;

    @BeforeEach
    void setUp() {
        contentService = new ContentServiceImpl(
                contentRepository,
                courseImplService,
                unitImplService,
                contentFileUploadService);
    }

    @Test
    void testCreateContent_Success() throws Exception {
        String courseId = "course-123";
        String unitId = "unit-456";

        when(courseImplService.findCourseId(courseId)).thenReturn(true);
        when(unitImplService.unitExists(unitId)).thenReturn(true);
        when(contentFileUploadService.uploadContent(any(), eq(courseId), eq("1")))
                .thenReturn("http://localhost:9000/content-files/video/course_course-123/lecture_1/uuid-video.mp4");

        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture_1.mp4", "video/mp4", "test video data".getBytes());

        ContentRequestDto request = ContentRequestDto.builder()
                .lessonIndex("1")
                .title("Introduction to Java")
                .description("Basics and Overview")
                .duration(360L)
                .build();

        when(contentRepository.save(any(Content.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ContentResponseDto response = contentService.createContent(courseId, unitId, request, file);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Content created successfully", response.getMessage());
        assertNotNull(response.getContent());
        assertEquals("Introduction to Java", response.getContent().getTitle());
        assertEquals(courseId, response.getContent().getCourseId());
        assertEquals(unitId, response.getContent().getUnitId());
        assertEquals("1", response.getContent().getLessonIndex());
        assertEquals("http://localhost:9000/content-files/video/course_course-123/lecture_1/uuid-video.mp4",
                response.getContent().getContentUrl());

        ArgumentCaptor<Content> contentCaptor = ArgumentCaptor.forClass(Content.class);
        verify(contentRepository).save(contentCaptor.capture());
        Content captured = contentCaptor.getValue();
        assertEquals("Introduction to Java", captured.getTitle());
    }

    @Test
    void testCreateContent_CourseNotFound() {
        String courseId = "invalid-course";
        String unitId = "unit-456";

        when(courseImplService.findCourseId(courseId)).thenReturn(false);

        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture_1.mp4", "video/mp4", "data".getBytes());

        ContentRequestDto request = ContentRequestDto.builder()
                .lessonIndex("1")
                .title("Intro")
                .description("Desc")
                .duration(100L)
                .build();

        assertThrows(RuntimeException.class, () -> contentService.createContent(courseId, unitId, request, file));
    }

    @Test
    void testCreateContent_UnitNotFound() {
        String courseId = "course-123";
        String unitId = "invalid-unit";

        when(courseImplService.findCourseId(courseId)).thenReturn(true);
        when(unitImplService.unitExists(unitId)).thenReturn(false);

        MockMultipartFile file = new MockMultipartFile(
                "file", "lecture_1.mp4", "video/mp4", "data".getBytes());

        ContentRequestDto request = ContentRequestDto.builder()
                .lessonIndex("1")
                .title("Intro")
                .description("Desc")
                .duration(100L)
                .build();

        assertThrows(RuntimeException.class, () -> contentService.createContent(courseId, unitId, request, file));
    }

    @Test
    void testCreateContent_MissingFile() {
        String courseId = "course-123";
        String unitId = "unit-456";

        ContentRequestDto request = ContentRequestDto.builder()
                .lessonIndex("1")
                .title("Intro")
                .description("Desc")
                .duration(100L)
                .build();

        assertThrows(IllegalArgumentException.class,
                () -> contentService.createContent(courseId, unitId, request, null));
    }
}
