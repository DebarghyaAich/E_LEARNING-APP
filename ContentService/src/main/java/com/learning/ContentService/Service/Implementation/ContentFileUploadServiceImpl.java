package com.learning.ContentService.Service.Implementation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
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
            ".wmv"
    );

    @Override
    public List<String> uploadContent(List<MultipartFile> files, String courseId, String lessonId) {
        if (files == null || files.isEmpty()) {
            throw new RuntimeException("No files provided");
        }

        if (!Boolean.TRUE.equals(courseImplService.findCourseById(courseId))) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        createBucketIfNotExists(properties.getBucketName());

        List<MultipartFile> videos = new ArrayList<>();
        List<MultipartFile> pdfs = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                ContentType type = detectContentType(file);
                if (type == ContentType.VIDEO) {
                    videos.add(file);
                } else if (type == ContentType.PDF) {
                    pdfs.add(file);
                } else {
                    throw new RuntimeException("Unsupported file type for file: " + file.getOriginalFilename());
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to detect content type for " + file.getOriginalFilename() + ": " + e.getMessage(), e);
            }
        }

        List<String> uploadedUrls = new ArrayList<>();

        if (!videos.isEmpty()) {
            uploadedUrls.addAll(uploadVideo(videos, courseId, lessonId));
        }

        if (!pdfs.isEmpty()) {
            uploadedUrls.addAll(uploadPdf(pdfs, courseId, lessonId));
        }

        return uploadedUrls;
    }

    @Override
    public List<String> uploadVideo(List<MultipartFile> videos, String courseId, String unitId) {
        if (videos == null || videos.isEmpty()) {
            throw new RuntimeException("No video provided");
        }

        if (!Boolean.TRUE.equals(courseImplService.findCourseById(courseId))) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        if (!ContentType.VIDEO.equals(isAllValidVideo(videos))) {
            throw new RuntimeException("Invalid videos provided");
        }

        createBucketIfNotExists(properties.getBucketName());

        // Sort videos according to natural lecture order pattern (e.g., lecture_1, lecture_2, 01_intro, etc.)
        List<MultipartFile> orderedVideos = new ArrayList<>(videos);
        orderedVideos.sort((v1, v2) -> {
            int num1 = extractLectureNumber(v1.getOriginalFilename());
            int num2 = extractLectureNumber(v2.getOriginalFilename());
            if (num1 != -1 && num2 != -1) {
                return Integer.compare(num1, num2);
            }
            if (num1 != -1) return -1;
            if (num2 != -1) return 1;
            return String.CASE_INSENSITIVE_ORDER.compare(
                    v1.getOriginalFilename() != null ? v1.getOriginalFilename() : "",
                    v2.getOriginalFilename() != null ? v2.getOriginalFilename() : ""
            );
        });

        // Validate no duplicate lecture numbers in the provided batch
        Set<Integer> seenIndices = new HashSet<>();
        for (MultipartFile video : orderedVideos) {
            int idx = extractLectureNumber(video.getOriginalFilename());
            if (idx != -1 && !seenIndices.add(idx)) {
                throw new RuntimeException("Duplicate lecture pattern detected in uploaded videos: " + idx);
            }
        }

        List<String> videoUrls = new ArrayList<>();

        for (int i = 0; i < orderedVideos.size(); i++) {
            MultipartFile video = orderedVideos.get(i);
            int lectureIndex = extractLectureNumber(video.getOriginalFilename());
            if (lectureIndex == -1) {
                lectureIndex = i + 1; // Default to 1-based sequential order if no number in filename
            }

            String lecturePattern = "lecture_" + String.format("%02d", lectureIndex);
            String originalFilename = video.getOriginalFilename();
            String cleanFileName = (originalFilename != null)
                    ? originalFilename.replaceAll("\\s+", "_")
                    : "video.mp4";

            String uuid = UUID.randomUUID().toString();
            String unitFolder = (unitId != null && !unitId.isBlank()) ? "units/" + unitId + "/" : "";
            String objectName = "courses/" + courseId + "/" + unitFolder + "lectures/" + lecturePattern + "/" + uuid + "-" + cleanFileName;

            try {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(properties.getBucketName())
                                .object(objectName)
                                .stream(video.getInputStream(), video.getSize(), -1)
                                .contentType(video.getContentType())
                                .userMetadata(Map.of(
                                        "lecture-order", String.valueOf(lectureIndex),
                                        "lecture-pattern", lecturePattern,
                                        "course-id", courseId,
                                        "unit-id", unitId != null ? unitId : ""
                                ))
                                .build()
                );

                String presignedUrl = minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .method(Method.GET)
                                .bucket(properties.getBucketName())
                                .object(objectName)
                                .expiry(60 * 60 * 24 * 7)
                                .build()
                );

                videoUrls.add(presignedUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload video [" + cleanFileName + "] to MinIO: " + e.getMessage(), e);
            }
        }

        return videoUrls;
    }

    @Override
    public List<String> uploadPdf(List<MultipartFile> pdfs, String courseId, String unitId) {
        if (pdfs == null || pdfs.isEmpty()) {
            throw new RuntimeException("No pdf provided");
        }

        if (!Boolean.TRUE.equals(courseImplService.findCourseById(courseId))) {
            throw new RuntimeException("Course not found with id " + courseId);
        }

        if (!ContentType.PDF.equals(isAllValidPdf(pdfs))) {
            throw new RuntimeException("Invalid pdfs provided");
        }

        createBucketIfNotExists(properties.getBucketName());

        List<MultipartFile> orderedPdfs = new ArrayList<>(pdfs);
        orderedPdfs.sort((p1, p2) -> {
            int num1 = extractLectureNumber(p1.getOriginalFilename());
            int num2 = extractLectureNumber(p2.getOriginalFilename());
            if (num1 != -1 && num2 != -1) {
                return Integer.compare(num1, num2);
            }
            if (num1 != -1) return -1;
            if (num2 != -1) return 1;
            return String.CASE_INSENSITIVE_ORDER.compare(
                    p1.getOriginalFilename() != null ? p1.getOriginalFilename() : "",
                    p2.getOriginalFilename() != null ? p2.getOriginalFilename() : ""
            );
        });

        Set<Integer> seenIndices = new HashSet<>();
        for (MultipartFile pdf : orderedPdfs) {
            int idx = extractLectureNumber(pdf.getOriginalFilename());
            if (idx != -1 && !seenIndices.add(idx)) {
                throw new RuntimeException("Duplicate lecture pattern detected in uploaded pdfs: " + idx);
            }
        }

        List<String> pdfUrls = new ArrayList<>();
        for (int i = 0; i < orderedPdfs.size(); i++) {
            MultipartFile pdf = orderedPdfs.get(i);
            int lectureIndex = extractLectureNumber(pdf.getOriginalFilename());
            if (lectureIndex == -1) {
                lectureIndex = i + 1;
            }

            String lecturePattern = "lecture_" + String.format("%02d", lectureIndex);
            String originalFilename = pdf.getOriginalFilename();
            String cleanFileName = (originalFilename != null)
                    ? originalFilename.replaceAll("\\s+", "_")
                    : "document.pdf";

            String uuid = UUID.randomUUID().toString();
            String unitFolder = (unitId != null && !unitId.isBlank()) ? "units/" + unitId + "/" : "";
            String objectName = "courses/" + courseId + "/" + unitFolder + "pdfs/" + lecturePattern + "/" + uuid + "-" + cleanFileName;

            try {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(properties.getBucketName())
                                .object(objectName)
                                .stream(pdf.getInputStream(), pdf.getSize(), -1)
                                .contentType(pdf.getContentType())
                                .userMetadata(Map.of(
                                        "lecture-order", String.valueOf(lectureIndex),
                                        "lecture-pattern", lecturePattern,
                                        "course-id", courseId,
                                        "unit-id", unitId != null ? unitId : ""
                                ))
                                .build()
                );

                String presignedUrl = minioClient.getPresignedObjectUrl(
                        GetPresignedObjectUrlArgs.builder()
                                .method(Method.GET)
                                .bucket(properties.getBucketName())
                                .object(objectName)
                                .expiry(60 * 60 * 24 * 7)
                                .build()
                );

                pdfUrls.add(presignedUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload pdf [" + cleanFileName + "] to MinIO: " + e.getMessage(), e);
            }
        }

        return pdfUrls;
    }

    @Override
    public int extractLectureNumber(String filename) {
        if (filename == null) {
            return -1;
        }
        Matcher matcher = Pattern.compile("(?i)(?:lecture|lec|lesson|unit)?(?:[_\\-\\s]*)(\\d+)").matcher(filename);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {
            }
        }
        return -1;
    }

    @Override
    public ContentType isAllValidVideo(List<MultipartFile> videos) {
        return isValidVideo(videos);
    }

    @Override
    public ContentType isAllValidPdf(List<MultipartFile> pdfs) {
        return isValidPdf(pdfs);
    }

    @Override
    public void createBucketIfNotExists(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to check or create bucket " + bucketName, e);
        }
    }

    @Override
    public ContentType isValidVideo(List<MultipartFile> videos) {
        if (videos == null || videos.isEmpty()) {
            throw new RuntimeException("No video provided");
        }

        boolean allVideos = videos.stream().allMatch(video -> {
            String contentType = video.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return false;
            }
            String filename = video.getOriginalFilename();
            if (filename == null || !filename.contains(".")) {
                return false;
            }
            String extension = filename
                    .substring(filename.lastIndexOf("."))
                    .toLowerCase(Locale.ROOT);
            return VIDEO_EXTENSIONS.contains(extension);
        });

        if (!allVideos) {
            throw new RuntimeException("Invalid file in videos list");
        }

        return ContentType.VIDEO;
    }

    @Override
    public ContentType isValidPdf(List<MultipartFile> pdfs) {
        if (pdfs == null || pdfs.isEmpty()) {
            throw new RuntimeException("No pdf provided");
        }

        boolean allPdf = pdfs.stream().allMatch(pdf -> {
            if (!"application/pdf".equalsIgnoreCase(pdf.getContentType())) {
                return false;
            }
            String filename = pdf.getOriginalFilename();
            if (filename == null || !filename.contains(".")) {
                return false;
            }
            String extension = filename
                    .substring(filename.lastIndexOf("."))
                    .toLowerCase(Locale.ROOT);
            return extension.equals(".pdf");
        });

        if (!allPdf) {
            throw new RuntimeException("Invalid file in pdfs list");
        }

        return ContentType.PDF;
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
        if ("application/pdf".equalsIgnoreCase(contentType) && extension.equals(".pdf")) {
            return ContentType.PDF;
        }

        // Video
        if (contentType != null
                && contentType.toLowerCase(Locale.ROOT).startsWith("video/")
                && VIDEO_EXTENSIONS.contains(extension)) {
            return ContentType.VIDEO;
        }

        return ContentType.NONE;
    }

    @Override
    public ContentType DetectContentType(MultipartFile file) throws Exception {
        return detectContentType(file);
    }
}
