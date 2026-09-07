package com.learning.services.implementations;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.configurations.MinioConfig;
import com.learning.services.ThumbnailUpdate;
import com.learning.services.ThumbnailUpload;

import io.minio.MinioClient;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThumbnailUpdateImpl implements ThumbnailUpdate {

    private final ThumbnailUpload thumbnailUpload;
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @Override
    public String update(String courseId, MultipartFile file, String existingUrl) {
        if (courseId == null || courseId.isBlank()) {
            throw new RuntimeException("Course ID is required for updating thumbnail");
        }

        // No new file — keep existing URL
        if (file == null || file.isEmpty()) {
            return existingUrl;
        }

        // Delete old object from MinIO if URL exists
        if (existingUrl != null && !existingUrl.isBlank()) {
            try {
                // Extract object name: everything after the bucket name in the path
                String objectName = extractObjectName(existingUrl);
                if (objectName != null && !objectName.isBlank()) {
                    minioClient.removeObject(
                            RemoveObjectArgs.builder()
                                    .bucket(minioConfig.getBucketName())
                                    .object(objectName)
                                    .build());
                    log.info("Deleted old thumbnail object: {}", objectName);
                }
            } catch (Exception e) {
                log.warn("Could not delete old thumbnail from MinIO: {}", e.getMessage());
                // Non-fatal — proceed with upload even if delete fails
            }
        }

        // Upload new thumbnail
        return thumbnailUpload.upload(file);
    }

    /**
     * Extracts the MinIO object name from a presigned URL.
     * e.g.
     * "http://localhost:9000/course-thumbnail/course/image/uuid-name.jpg?X-Amz..."
     * → "course/image/uuid-name.jpg"
     */
    private String extractObjectName(String presignedUrl) {
        try {
            // Strip query string
            String path = presignedUrl.contains("?") ? presignedUrl.substring(0, presignedUrl.indexOf('?'))
                    : presignedUrl;
            // Strip scheme + host + port + /bucketName/
            String bucket = minioConfig.getBucketName();
            int bucketIdx = path.indexOf("/" + bucket + "/");
            if (bucketIdx != -1) {
                return path.substring(bucketIdx + bucket.length() + 2);
            }
        } catch (Exception e) {
            log.warn("Failed to extract object name from URL: {}", presignedUrl);
        }
        return null;
    }
}
