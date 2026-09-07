package com.learning.ContentService.Service.Implementation;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Configurations.MinioConfig;
import com.learning.ContentService.Entities.ContentType;
import com.learning.ContentService.Service.ContentFileUploadService;
import com.learning.ContentService.Service.CourseImplService;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContentFileUploadServiceImpl implements ContentFileUploadService {

    private final MinioClient minioClient;
    private final MinioConfig properties;
    private final CourseImplService courseImplService;

    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList(
            ".mp4",
            ".mkv",
            ".avi",
            ".mov",
            ".webm",
            ".flv",
            ".wmv");

    @Override
    public String uploadContent(MultipartFile file, String courseId, String lessonIndex) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("No file provided");
        }

        // Check whether course exists
        if (!Boolean.TRUE.equals(courseImplService.findCourseId(courseId))) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        // Create bucket if it does not exist
        createBucketIfNotExists(properties.getBucketName());

        // Detect content type
        ContentType contentType = detectContentType(file);

        if (contentType == ContentType.NONE) {
            throw new RuntimeException("Unsupported file type: " + file.getOriginalFilename());
        }

        String subFolder = contentType.name().toLowerCase(Locale.ROOT);
        String coursePattern = "course_" + courseId;
        String lecturePattern = "lecture_" + (lessonIndex != null && !lessonIndex.isBlank() ? lessonIndex.trim() : "1");

        String uuid = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String cleanFileName = (originalFilename != null)
                ? originalFilename.replaceAll("\\s+", "_")
                : "content.file";

        String objName = subFolder + "/"
                + coursePattern + "/"
                + lecturePattern + "/"
                + uuid + "-"
                + cleanFileName;

        String mimeType = file.getContentType();
        if (mimeType == null || mimeType.isBlank() || "application/octet-stream".equalsIgnoreCase(mimeType)) {
            if (contentType == ContentType.VIDEO) {
                mimeType = cleanFileName.endsWith(".mp4") ? "video/mp4" : "video/*";
            } else if (contentType == ContentType.PDF) {
                mimeType = "application/pdf";
            }
        }

        // Upload to MinIO
        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(properties.getBucketName())
                        .object(objName)
                        .stream(
                                file.getInputStream(),
                                file.getSize(),
                                -1)
                        .contentType(mimeType)
                        .userMetadata(
                                Map.of(
                                        "course-id", courseId,
                                        "lecture-pattern", lecturePattern,
                                        "lecture-index", (lessonIndex != null ? lessonIndex.trim() : "1")))
                        .build());

        // Generate presigned URL
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(properties.getBucketName())
                        .object(objName)
                        .expiry(60 * 60 * 24 * 7)
                        .build());
    }

    @Override
    public void createBucketIfNotExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build());

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to check or create bucket " + bucketName, e);
        }
    }

    @Override
    public ContentType detectContentType(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new Exception("No file provided");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        if (filename == null || !filename.contains(".")) {
            throw new Exception("Invalid filename");
        }

        String extension = filename
                .substring(filename.lastIndexOf("."))
                .toLowerCase(Locale.ROOT);

        // PDF
        if (extension.equals(".pdf") || "application/pdf".equalsIgnoreCase(contentType)) {
            return ContentType.PDF;
        }

        // Video
        if (VIDEO_EXTENSIONS.contains(extension)
                || (contentType != null && contentType.toLowerCase(Locale.ROOT).startsWith("video/"))) {
            return ContentType.VIDEO;
        }

        return ContentType.NONE;
    }
}
