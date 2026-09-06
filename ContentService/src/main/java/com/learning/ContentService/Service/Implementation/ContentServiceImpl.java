package com.learning.ContentService.Service.Implementation;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Repositories.ContentRepository;
import com.learning.ContentService.Service.ContentService;
import com.learning.ContentService.Service.CourseImplService;

@Service
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final CourseImplService courseImplService;

    public ContentServiceImpl(ContentRepository contentRepository, CourseImplService courseImplService) {
        this.contentRepository = contentRepository;
        this.courseImplService = courseImplService;
    }

    @Override
    public void uploadContents(ContentBatchRequest request,
            List<MultipartFile> video,
            List<MultipartFile> pdfs) {
        if (!Boolean.TRUE.equals(courseImplService.findCourseId(request.getCourseId()))) {
            throw new RuntimeException("Course not found");
        }
    }

}
