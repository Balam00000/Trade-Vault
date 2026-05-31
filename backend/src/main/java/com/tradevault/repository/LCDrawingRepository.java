package com.tradevault.repository;

import com.tradevault.entity.LCDrawing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LCDrawingRepository extends JpaRepository<LCDrawing, Long> {
    List<LCDrawing> findByLcIdOrderByPresentationDateDesc(Long lcId);
    Optional<LCDrawing> findByDrawingRef(String drawingRef);
}
