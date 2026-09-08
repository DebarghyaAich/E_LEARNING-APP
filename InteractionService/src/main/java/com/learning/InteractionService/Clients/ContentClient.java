package com.learning.InteractionService.Clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "ContentService", url = "${contentservice.url:http://localhost:8083}")
public interface ContentClient {

    @GetMapping("/api/v1/content/exists")
    Boolean contentExists(@RequestParam("contentId") String contentId);

}
