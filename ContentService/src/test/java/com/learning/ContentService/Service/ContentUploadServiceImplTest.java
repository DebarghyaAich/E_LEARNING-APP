package com.learning.ContentService.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.learning.ContentService.Configurations.MinioConfig;
import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Dtos.ContentBatchResponseDto;
import com.learning.ContentService.Dtos.ContentItemRequestDto;
import com.learning.ContentService.Entities.Content;
import com.learning.ContentService.Repositories.ContentRepository;
import com.learning.ContentService.Service.Implementation.ContentBatchFileUploadServiceImpl;
import com.learning.ContentService.Service.Implementation.ContentBatchUploadServiceImpl;

import io.minio.MinioClient;

@ExtendWith(MockitoExtension.class)
class ContentUploadServiceImplTest {

    @Mock
    private ContentRepository contentRepository;

    @Mock
    private CourseImplService courseImplService;

    @Mock
    private UnitImplService unitImplService;

    @Mock
    private MinioClient minioClient;

    @Mock
    private MinioConfig minioConfig;

    private ContentFileUploadService contentFileUploadService;
    private ContentBatchUploadServiceImpl contentUploadService;

    @BeforeEach
    void setUp() {
        contentFileUploadService = new ContentBatchFileUploadServiceImpl(minioClient, minioConfig, courseImplService);
        contentUploadService = new ContentBatchUploadServiceImpl(contentRepository, courseImplService, contentFileUploadService, unitImplService);
    }

    @Test
    void testExtractLectureNumber() {
        assertEquals("1", contentFileUploadService.extractLectureNumber("lecture_1.mp4"));
        assertEquals("02", contentFileUploadService.extractLectureNumber("course2024_lecture_02.mp4"));
        assertEquals("3", contentFileUploadService.extractLectureNumber("1080p_lecture_3.mp4"));
        assertEquals("01", contentFileUploadService.extractLectureNumber("01_intro.mp4"));
        assertEquals("4", contentFileUploadService.extractLectureNumber("video_4.mp4"));
        assertEquals("5", contentFileUploadService.extractLectureNumber("5.pdf"));
        assertEquals("6", contentFileUploadService.extractLectureNumber("lesson-6.pdf"));
        assertNull(contentFileUploadService.extractLectureNumber("invalid_filename.mp4"));
    }

    @Test
    void testUploadContents_Success() throws Exception {
        String courseId = "course-123";
        String unitId = "unit-uuid-456";
        when(courseImplService.findCourseId(courseId)).thenReturn(true);
        when(unitImplService.unitExists(unitId)).thenReturn(true);
        when(minioConfig.getBucketName()).thenReturn("content-files");

        MockMultipartFile videoFile = new MockMultipartFile(
                "files", "lecture_1.mp4", "video/mp4", "fake video data".getBytes());
        MockMultipartFile pdfFile = new MockMultipartFile(
                "files", "lecture_2.pdf", "application/pdf", "fake pdf data".getBytes());

        ContentItemRequestDto videoItem = new ContentItemRequestDto();
        videoItem.setLessonIndex("1");
        videoItem.setTitle("Lecture 1 Video");
        videoItem.setDescription("Video Introduction");
        videoItem.setDuration(300L);

        ContentItemRequestDto pdfItem = new ContentItemRequestDto();
        pdfItem.setLessonIndex("2");
        pdfItem.setTitle("Lecture 2 Notes");
        pdfItem.setDescription("PDF Notes");
        pdfItem.setDuration(60L);

        ContentBatchRequest request = new ContentBatchRequest();
        request.setContents(List.of(videoItem, pdfItem));

        when(contentRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ContentBatchResponseDto response = contentUploadService.uploadContents(courseId, unitId, request, List.of(videoFile, pdfFile));

        assertTrue(response.getSuccess());
        assertEquals("Content uploaded successfully", response.getMessage());
        assertEquals(2, response.getContents().size());

        // Verify files were injected into DTOs
        assertNotNull(videoItem.getFile());
        assertEquals("lecture_1.mp4", videoItem.getFile().getOriginalFilename());
        assertNotNull(pdfItem.getFile());
        assertEquals("lecture_2.pdf", pdfItem.getFile().getOriginalFilename());

        // Verify contentRepository.saveAll was called
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Content>> captor = ArgumentCaptor.forClass(List.class);
        verify(contentRepository).saveAll(captor.capture());

        List<Content> saved = captor.getValue();
        assertEquals(2, saved.size());

        Content savedVideo = saved.get(0);
        assertEquals(courseId, savedVideo.getCourseId());
        assertEquals(unitId, savedVideo.getUnitId());
        assertEquals("1", savedVideo.getLessonIndex());
        assertEquals("Lecture 1 Video", savedVideo.getTitle());

        Content savedPdf = saved.get(1);
        assertEquals(courseId, savedPdf.getCourseId());
        assertEquals(unitId, savedPdf.getUnitId());
        assertEquals("2", savedPdf.getLessonIndex());
        assertEquals("Lecture 2 Notes", savedPdf.getTitle());
    }

    @Test
    void testUploadContents_DuplicateSequenceNumbers_ThrowsException() {
        String courseId = "course-123";
        String unitId = "unit-uuid-456";
        when(courseImplService.findCourseId(courseId)).thenReturn(true);
        when(unitImplService.unitExists(unitId)).thenReturn(true);

        MockMultipartFile videoFile1 = new MockMultipartFile(
                "files", "lecture_1.mp4", "video/mp4", "data1".getBytes());

        ContentItemRequestDto item1 = new ContentItemRequestDto();
        item1.setLessonIndex("1");
        item1.setTitle("Lecture 1 Video");
        item1.setDuration(300L);

        ContentItemRequestDto item2 = new ContentItemRequestDto();
        item2.setLessonIndex("1");
        item2.setTitle("Lecture 1 Duplicate");
        item2.setDuration(300L);

        ContentBatchRequest request = new ContentBatchRequest();
        request.setContents(List.of(item1, item2));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                contentUploadService.uploadContents(courseId, unitId, request, List.of(videoFile1))
        );

        assertEquals("Duplicate lesson index detected in content batch: 1", exception.getMessage());
    }
}
