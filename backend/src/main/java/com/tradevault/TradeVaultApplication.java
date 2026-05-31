package com.tradevault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.tradevault.entity")
@EnableJpaRepositories("com.tradevault.repository")
public class TradeVaultApplication {
    public static void main(String[] args) {
        SpringApplication.run(TradeVaultApplication.class, args);
    }
}
