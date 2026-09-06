package com.learning.ContentService.Service.Implementation;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
public class ContentBatchFileUploadServiceImpl implements ContentFileUploadService {

    private final MinioClient minioClient;
    private final MinioConfig properties;
    private final CourseImplService courseImplService;

    private static final Pattern EXPLICIT_LECTURE_PATTERN = Pattern
            .compile("(?i)(?:lecture|lec|lesson)[_\\-\\s]*(\\d+)");

    private static final Pattern LEADING_NUMBER_PATTERN = Pattern.compile("^\\s*(\\d+)(?:[_\\-\\s.]|$)");

    private static final Pattern TRAILING_NUMBER_PATTERN = Pattern.compile("[_\\-\\s](\\d+)$");

    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList(
            ".mp4",
            ".mkv",
            ".avi",
            ".mov",
            ".webm",
            ".flv",
            ".wmv");

    @Override
    public String uploadContent(MultipartFile file, String courseId) throws Exception {

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
            throw new RuntimeException(
                    "Unsupported file type: " + file.getOriginalFilename());
        }

        // pdf / video
        String subFolder = contentType.name().toLowerCase(Locale.ROOT);

        // course_123
        String coursePattern = "course_" + courseId;

        /*
         * Determine lecture number.
         *
         * Priority:
         * 1. lessonIndex from request
         * 2. lecture number extracted from filename
         * 3. default to "1"
         */
        // String lectureNumber;

        // if (lessonIndex != null && !lessonIndex.trim().isEmpty()) {

        // lectureNumber = lessonIndex.trim();

        // } else {

        String lectureNumber = extractLectureNumber(
                file.getOriginalFilename());

        if (lectureNumber == null || lectureNumber.isBlank()) {
            throw new RuntimeException("wrong filename format for " + file.getOriginalFilename());
        }
        // }

        // lecture_01, lecture_02, lecture_10, etc.
        String lecturePattern = "lecture_" + lectureNumber;

        // Generate unique ID
        String uuid = UUID.randomUUID().toString();

        // Get original filename
        String originalFilename = file.getOriginalFilename();

        // Replace spaces with _
        String cleanFileName = (originalFilename != null)
                ? originalFilename.replaceAll("\\s+", "_")
                : "content.file";

        /*
         * Example object path:
         *
         * video/course_101/lecture_03/uuid-Spring_Boot.mp4
         *
         * pdf/course_101/lecture_03/uuid-notes.pdf
         */
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
                                        "lecture-index", lectureNumber))
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
    public String extractLectureNumber(String filename) {
        if (filename == null || filename.isBlank()) {
            return null;
        }

        // remove the extension postion from the file name if exists e.g. .mp4 or .pdf
        int lastDotIndex = filename.lastIndexOf('.');
        String baseName = (lastDotIndex > 0) ? filename.substring(0, lastDotIndex) : filename;

        // 1. Explicit keyword match (e.g. lecture_1, lec-02, lesson 3, unit_4)
        Matcher explicitMatcher = EXPLICIT_LECTURE_PATTERN.matcher(baseName);
        if (explicitMatcher.find()) {
            return explicitMatcher.group(1);
        }

        // 2. Leading number match (e.g. 01_intro, 2-overview, 3.setup)
        Matcher leadingMatcher = LEADING_NUMBER_PATTERN.matcher(baseName);
        if (leadingMatcher.find()) {
            return leadingMatcher.group(1);
        }

        // 3. Trailing number match (e.g. intro_1, chapter-2)
        Matcher trailingMatcher = TRAILING_NUMBER_PATTERN.matcher(baseName);
        if (trailingMatcher.find()) {
            return trailingMatcher.group(1);
        }

        return null;
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
