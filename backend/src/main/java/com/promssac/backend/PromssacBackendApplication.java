package com.promssac.backend;

import com.promssac.backend.config.EntelOnWayProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableConfigurationProperties(EntelOnWayProperties.class)
@EnableJpaRepositories(basePackages = "com.promssac.backend.repository")
@EnableTransactionManagement
public class PromssacBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PromssacBackendApplication.class, args);
    }
}
