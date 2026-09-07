package com.learning.ContentService.Service;

import org.springframework.web.multipart.MultipartFile;
import com.learning.ContentService.Entities.ContentType;

public interface ContentFileUploadService {

    void createBucketIfNotExists(String bucketName);

    ContentType detectContentType(MultipartFile file) throws Exception;

    String uploadContent(MultipartFile file, String courseId, String lessonIndex) throws Exception;

}
