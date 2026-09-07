package com.learning.services;

import org.springframework.web.multipart.MultipartFile;

public interface ThumbnailUpdate {
    String update(String courseId, MultipartFile file, String existingUrl);
}
