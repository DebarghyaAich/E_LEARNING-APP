package com.learning.UnitService.Repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.learning.UnitService.Entities.Unit;

@Repository
public interface UnitRepository extends JpaRepository<Unit, String> {

    boolean existsByUnitId(String unitId);

    Optional<Unit> findByUnitId(String unitId);

    List<Unit> findByCourseIdOrderByUnitIndexAsc(String courseId);

    Optional<Unit> findByCourseIdAndUnitIndex(String courseId, Integer unitIndex);

    long countByCourseId(String courseId);

}
