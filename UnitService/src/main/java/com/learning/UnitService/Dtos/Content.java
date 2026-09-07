package com.learning.UnitService.Dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Content {

    private String contentId;
    private String courseId;
    private String unitId;
    private String lessonIndex;
    private String title;
    private String description;
    private Long duration;
    private String contentUrl;

}
