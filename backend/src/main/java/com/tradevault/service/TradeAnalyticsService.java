package com.tradevault.service;

import com.tradevault.entity.*;
import com.tradevault.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TradeAnalyticsService {

    @Autowired
    private LetterOfCreditRepository lcRepository;

    @Autowired
    private BankGuaranteeRepository bgRepository;

    @Autowired
    private ExportBillRepository billRepository;

    @Autowired
    private CreditFacilityRepository facilityRepository;

    @Autowired
    private SanctionsScreeningRepository screeningRepository;

    @Autowired
    private ComplianceCaseRepository caseRepository;

    public Map<String, Object> getAnalyticsSummary() {
        Map<String, Object> summary = new HashMap<>();

        // 1. Fetch all items
        List<LetterOfCredit> lcs = lcRepository.findAll();
        List<BankGuarantee> bgs = bgRepository.findAll();
        List<ExportBill> bills = billRepository.findAll();
        List<CreditFacility> facilities = facilityRepository.findAll();

        // 2. Aggregate Active Exposure
        BigDecimal lcExposure = lcs.stream()
                .filter(lc -> "ACTIVE".equals(lc.getStatus()) || "AMENDED".equals(lc.getStatus()))
                .map(LetterOfCredit::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal bgExposure = bgs.stream()
                .filter(bg -> "ACTIVE".equals(bg.getStatus()))
                .map(BankGuarantee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal billExposure = bills.stream()
                .filter(bill -> "DOCUMENTS_SENT".equals(bill.getStatus()) || "ACCEPTED".equals(bill.getStatus()))
                .map(ExportBill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExposure = lcExposure.add(bgExposure).add(billExposure);

        // 3. Aggregate Facilities Limits & Utilization
        BigDecimal totalLimit = facilities.stream()
                .filter(f -> "ACTIVE".equals(f.getStatus()))
                .map(CreditFacility::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUtilized = facilities.stream()
                .filter(f -> "ACTIVE".equals(f.getStatus()))
                .map(CreditFacility::getUtilizedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Counts
        long activeLcsCount = lcs.stream().filter(lc -> "ACTIVE".equals(lc.getStatus())).count();
        long activeBgsCount = bgs.stream().filter(bg -> "ACTIVE".equals(bg.getStatus())).count();
        long activeBillsCount = bills.stream().filter(bill -> !"PAID".equals(bill.getStatus())).count();
        
        long totalScreenings = screeningRepository.count();
        long openComplianceCases = caseRepository.countByCaseStatus("OPEN");

        // 5. Fill result map
        summary.put("totalExposure", totalExposure);
        summary.put("lcExposure", lcExposure);
        summary.put("bgExposure", bgExposure);
        summary.put("billExposure", billExposure);
        
        summary.put("totalLimit", totalLimit);
        summary.put("totalUtilized", totalUtilized);
        summary.put("utilizationRate", totalLimit.compareTo(BigDecimal.ZERO) > 0 
                ? totalUtilized.multiply(new BigDecimal("100")).divide(totalLimit, 2, BigDecimal.ROUND_HALF_UP) 
                : BigDecimal.ZERO);

        summary.put("activeLcsCount", activeLcsCount);
        summary.put("activeBgsCount", activeBgsCount);
        summary.put("activeBillsCount", activeBillsCount);
        
        summary.put("totalScreenings", totalScreenings);
        summary.put("openComplianceCases", openComplianceCases);

        return summary;
    }

    public Map<String, Object> getAnalyticsSummaryForClient(Long clientId) {
        Map<String, Object> summary = new HashMap<>();

        // 1. Fetch items filtered by clientId
        List<LetterOfCredit> lcs = lcRepository.findByClientId(clientId);
        List<BankGuarantee> bgs = bgRepository.findByClientId(clientId);
        List<ExportBill> bills = billRepository.findByClientId(clientId);
        List<CreditFacility> facilities = facilityRepository.findByClientId(clientId);

        // 2. Aggregate Active Exposure
        BigDecimal lcExposure = lcs.stream()
                .filter(lc -> "ACTIVE".equals(lc.getStatus()) || "AMENDED".equals(lc.getStatus()))
                .map(LetterOfCredit::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal bgExposure = bgs.stream()
                .filter(bg -> "ACTIVE".equals(bg.getStatus()))
                .map(BankGuarantee::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal billExposure = bills.stream()
                .filter(bill -> "DOCUMENTS_SENT".equals(bill.getStatus()) || "ACCEPTED".equals(bill.getStatus()))
                .map(ExportBill::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExposure = lcExposure.add(bgExposure).add(billExposure);

        // 3. Aggregate Facilities Limits & Utilization
        BigDecimal totalLimit = facilities.stream()
                .filter(f -> "ACTIVE".equals(f.getStatus()))
                .map(CreditFacility::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalUtilized = facilities.stream()
                .filter(f -> "ACTIVE".equals(f.getStatus()))
                .map(CreditFacility::getUtilizedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Counts
        long activeLcsCount = lcs.stream().filter(lc -> "ACTIVE".equals(lc.getStatus())).count();
        long activeBgsCount = bgs.stream().filter(bg -> "ACTIVE".equals(bg.getStatus())).count();
        long activeBillsCount = bills.stream().filter(bill -> !"PAID".equals(bill.getStatus())).count();
        
        long totalScreenings = 0;
        long openComplianceCases = 0;

        // 5. Fill result map
        summary.put("totalExposure", totalExposure);
        summary.put("lcExposure", lcExposure);
        summary.put("bgExposure", bgExposure);
        summary.put("billExposure", billExposure);
        
        summary.put("totalLimit", totalLimit);
        summary.put("totalUtilized", totalUtilized);
        summary.put("utilizationRate", totalLimit.compareTo(BigDecimal.ZERO) > 0 
                ? totalUtilized.multiply(new BigDecimal("100")).divide(totalLimit, 2, BigDecimal.ROUND_HALF_UP) 
                : java.math.BigDecimal.ZERO);

        summary.put("activeLcsCount", activeLcsCount);
        summary.put("activeBgsCount", activeBgsCount);
        summary.put("activeBillsCount", activeBillsCount);
        
        summary.put("totalScreenings", totalScreenings);
        summary.put("openComplianceCases", openComplianceCases);

        return summary;
    }
}
