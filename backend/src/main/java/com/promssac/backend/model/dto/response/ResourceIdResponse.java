package com.promssac.backend.model.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Respuesta mínima POST/PUT: solo el id del recurso creado o actualizado. */
@Getter
@Setter
@NoArgsConstructor
public class ResourceIdResponse {

    private String id;
}
