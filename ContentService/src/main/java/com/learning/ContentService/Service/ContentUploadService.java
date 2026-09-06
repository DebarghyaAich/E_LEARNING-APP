package com.learning.ContentService.Service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.learning.ContentService.Dtos.ContentBatchRequest;
import com.learning.ContentService.Dtos.ContentBatchResponseDto;

public interface ContentUploadService {

    ContentBatchResponseDto uploadContents(String courseId, String unitId, ContentBatchRequest request, List<MultipartFile> files) throws Exception;

}
