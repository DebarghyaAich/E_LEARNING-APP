package com.learning.services;

import com.learning.Entities.ThumbnailType;
import org.springframework.web.multipart.MultipartFile;

public interface ThumbnailUpload {
    ThumbnailType detectThumbnailType(MultipartFile file);

    String upload(MultipartFile file, ThumbnailType thumbnailType);

    void createBucketIfNotExists() throws Exception;

}
