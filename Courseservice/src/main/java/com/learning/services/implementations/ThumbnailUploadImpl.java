package com.learning.services.implementations;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Locale;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learning.Entities.ThumbnailType;
import com.learning.configurations.MinioConfig;
import com.learning.services.ThumbnailUpload;

import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
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
    public ThumbnailType detectThumbnailType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        // from mimie type
        String mimeType = file.getContentType();
        String lowermime = mimeType.toLowerCase(Locale.ROOT);
        if (lowermime.contains("image/")) {
            return ThumbnailType.IMAGE;
        }

        // from original file name.
        String fileExtension = file.getOriginalFilename();
        if (fileExtension == null) {
            throw new RuntimeException("File extension is not supported");
        }
        fileExtension = fileExtension.substring(fileExtension.lastIndexOf(".")).toLowerCase();
        if (IMAGE_EXTENSIONS.contains(fileExtension)) {
            return ThumbnailType.IMAGE;
        }
        throw new RuntimeException("File extension is not supported");
    }

    @Override
    public String upload(MultipartFile file, ThumbnailType thumbnailType) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        // check thumbnail type is matched with file's thumbnail type
        if (thumbnailType != detectThumbnailType(file)) {
            throw new RuntimeException("Thumbnail type is not matched with file's thumbnail type");
        }
        // get unique filename.
        String fileName = (file.getOriginalFilename() != null) ? file.getOriginalFilename().replaceAll("\\s", "_")
                : "thumbnail";
        String uuid = UUID.randomUUID().toString();
        String folder = detectThumbnailType(file) == ThumbnailType.IMAGE ? "course/image/" : "course/null/";

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
