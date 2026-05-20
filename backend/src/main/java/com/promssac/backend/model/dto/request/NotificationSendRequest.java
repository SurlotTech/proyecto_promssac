package com.promssac.backend.model.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationSendRequest {

    @NotBlank(message = "El email del destinatario es obligatorio")
    @Email(message = "El formato del email no es valido")
    private String destinatarioEmail;

    @Size(max = 200, message = "El nombre del destinatario no debe exceder 200 caracteres")
    private String destinatarioNombre;

    @NotBlank(message = "El asunto es obligatorio")
    @Size(max = 255, message = "El asunto no debe exceder 255 caracteres")
    private String asunto;

    @Size(max = 10000, message = "El contenido en texto plano no debe exceder 10000 caracteres")
    private String contenidoPlano;

    @Size(max = 50000, message = "El contenido HTML no debe exceder 50000 caracteres")
    private String contenidoHtml;

    @Size(max = 64, message = "El tipo no debe exceder 64 caracteres")
    private String tipo;

    @Size(max = 64, message = "El código de orden no debe exceder 64 caracteres")
    private String ordenCodigo;
}
