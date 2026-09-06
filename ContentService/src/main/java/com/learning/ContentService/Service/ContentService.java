package com.learning.ContentService.Service;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import com.learning.ContentService.Dtos.ContentBatchRequest;

public interface ContentService {

    void uploadContents(ContentBatchRequest request, List<MultipartFile> video, List<MultipartFile> pdfs);

}
