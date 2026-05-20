package com.promssac.backend.model.dto.response;

import lombok.Value;

@Value
public class ClienteAutocompleteItem {

    String id;
    String email;
    String nombreIiee;
    String director;
    String codigoModular;
}
