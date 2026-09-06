package com.learning.ContentService.Service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.learning.ContentService.Entities.ContentType;

public interface ContentFileUploadService {

    ContentType isAllValidVideo(List<MultipartFile> videos);

    default ContentType isValidVideo(List<MultipartFile> videos) {
        return isAllValidVideo(videos);
    }

    ContentType isAllValidPdf(List<MultipartFile> pdfs);

    default ContentType isValidPdf(List<MultipartFile> pdfs) {
        return isAllValidPdf(pdfs);
    }

    ContentType detectContentType(MultipartFile file) throws Exception;

    default ContentType DetectContentType(MultipartFile file) throws Exception {
        return detectContentType(file);
    }

    List<String> uploadContent(List<MultipartFile> files, String courseId, String lessonId);

    List<String> uploadVideo(List<MultipartFile> videos, String courseId, String unitId);

    List<String> uploadPdf(List<MultipartFile> pdfs, String courseId, String unitId);

    int extractLectureNumber(String filename);

    void createBucketIfNotExists(String bucketName);

}
