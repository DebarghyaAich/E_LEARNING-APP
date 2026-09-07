package com.learning.Clients;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Component;

import com.learning.Dtos.Unit;

@Component
public class UnitClientFallback implements UnitClient {

    @Override
    public List<Unit> getUnitsByCourseId(String courseId) {
        return Collections.emptyList();
    }

}
