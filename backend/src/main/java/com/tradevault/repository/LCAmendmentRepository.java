package com.tradevault.repository;

import com.tradevault.entity.LCAmendment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LCAmendmentRepository extends JpaRepository<LCAmendment, Long> {
    List<LCAmendment> findByLcIdOrderByAmendmentNumberDesc(Long lcId);
    List<LCAmendment> findByStatus(String status);
}
