package com.learning.services;

import org.springframework.web.multipart.MultipartFile;

public interface ThumbnailUpload {

    void createBucketIfNotExists() throws Exception;

    boolean isImageFile(MultipartFile file);

    String upload(MultipartFile file);

}
