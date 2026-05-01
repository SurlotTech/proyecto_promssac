package com.promssac.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "promssac.entel.onway")
public class EntelOnWayProperties {

    private boolean enabled = false;

    private String baseUrl = "https://onway.entel.pe";

    private String cookie = "";

    private long groupId = -1;
}
