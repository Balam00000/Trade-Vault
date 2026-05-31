package com.tradevault.repository;

import com.tradevault.entity.BGClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BGClaimRepository extends JpaRepository<BGClaim, Long> {
    List<BGClaim> findByBgId(Long bgId);
    Optional<BGClaim> findByClaimRef(String claimRef);
}
