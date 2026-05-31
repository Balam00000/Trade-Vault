package com.tradevault.repository;

import com.tradevault.entity.BankGuarantee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankGuaranteeRepository extends JpaRepository<BankGuarantee, Long> {
    List<BankGuarantee> findByClientId(Long clientId);
    Optional<BankGuarantee> findByBgNumber(String bgNumber);
    List<BankGuarantee> findAllByOrderByCreatedAtDesc();
}
