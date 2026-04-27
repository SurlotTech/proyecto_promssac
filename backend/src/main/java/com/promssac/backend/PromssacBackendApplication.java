package com.promssac.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.promssac.backend.repository")
@EnableTransactionManagement
public class PromssacBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PromssacBackendApplication.class, args);
    }
}
