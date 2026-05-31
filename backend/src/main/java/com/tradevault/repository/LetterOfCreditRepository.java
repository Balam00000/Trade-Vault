package com.tradevault.repository;

import com.tradevault.entity.LetterOfCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LetterOfCreditRepository extends JpaRepository<LetterOfCredit, Long> {
    List<LetterOfCredit> findByClientId(Long clientId);
    Optional<LetterOfCredit> findByLcNumber(String lcNumber);
    List<LetterOfCredit> findAllByOrderByCreatedAtDesc();
}
