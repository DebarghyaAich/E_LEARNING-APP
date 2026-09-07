package com.learning.ContentService.Service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.learning.ContentService.Dtos.ContentRequestDto;
import com.learning.ContentService.Dtos.ContentResponseDto;
import com.learning.ContentService.Entities.Content;

public interface ContentService {

    ContentResponseDto createContent(String courseId, String unitId, ContentRequestDto request, MultipartFile file)
            throws Exception;

    List<Content> getContentsByUnitId(String unitId);
}
