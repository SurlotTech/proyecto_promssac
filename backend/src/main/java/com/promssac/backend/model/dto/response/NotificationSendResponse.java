package com.promssac.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationSendResponse {

    private String messageId;
    private String estado;
}
