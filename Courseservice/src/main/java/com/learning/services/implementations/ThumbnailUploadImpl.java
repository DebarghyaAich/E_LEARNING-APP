package com.learning.services.implementations;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.configurations.MinioConfig;
import com.learning.services.ThumbnailUpload;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;

@Service
public class ThumbnailUploadImpl implements ThumbnailUpload {
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public ThumbnailUploadImpl(MinioClient minioClient, MinioConfig minioConfig) {
        this.minioClient = minioClient;
        this.minioConfig = minioConfig;
    }

    private static final List<String> IMAGE_EXTENSIONS = List.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".gif",
            ".webp",
            ".avif",
            ".bmp",
            ".tiff",
            ".tif",
            ".svg",
            ".ico");

    @Override
    public boolean isImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check MIME type
        String mimeType = file.getContentType();
        if (mimeType != null && mimeType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            return true;
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."))
                    .toLowerCase(Locale.ROOT);
            if (IMAGE_EXTENSIONS.contains(fileExtension)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!isImageFile(file)) {
            throw new RuntimeException("Only image content is allowed for course thumbnail");
        }

        // get unique filename
        String fileName = (file.getOriginalFilename() != null) ? file.getOriginalFilename().replaceAll("\\s", "_")
                : "thumbnail";
        String uuid = UUID.randomUUID().toString();
        String folder = "course/image/";

        String objectName = folder + uuid + "-" + fileName;

        // upload this to minio and get presigned URL
        try {
            createBucketIfNotExists();
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(minioConfig.getBucketName()).object(objectName).stream(
                            file.getInputStream(), file.getSize(), -1).contentType(file.getContentType()).build());

            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder().method(Method.GET).bucket(minioConfig.getBucketName())
                            .object(objectName).expiry(60 * 60 * 24 * 7).build());
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload thumbnail to MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public void createBucketIfNotExists() throws Exception {
        boolean found = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build());

        if (!found) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build());
        }

    }

}
