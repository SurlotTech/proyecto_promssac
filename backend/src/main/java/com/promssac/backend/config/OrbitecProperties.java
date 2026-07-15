package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "promssac.orbitec")
public class OrbitecProperties {

    private boolean enabled = false;

    private String apiBaseUrl = "https://ep.web.orbitrack.orbitec.pe";

    private String username = "";

    private String password = "";

    private String companySlugName = "";

    private int devicesLimit = 5000;

    private String devicesOrdering = "name";
}
