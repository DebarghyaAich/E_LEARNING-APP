package com.learning.ContentService.Service;

import org.springframework.web.multipart.MultipartFile;
import com.learning.ContentService.Entities.ContentType;

public interface ContentFileUploadService {

    // int extractLectureNumber(String filename);

    void createBucketIfNotExists(String bucketName);

    ContentType detectContentType(MultipartFile file) throws Exception;

    String extractLectureNumber(String filename);

    String uploadContent(MultipartFile file, String courseId) throws Exception;

}
