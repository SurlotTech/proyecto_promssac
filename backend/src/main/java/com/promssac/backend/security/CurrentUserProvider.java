package com.promssac.backend.security;

import java.util.Optional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public Optional<WebUserDetails> currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof WebUserDetails user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public String currentUserNameOrSystem() {
        return currentUser()
                .map(WebUserDetails::getNombreCompleto)
                .filter(name -> !name.isBlank())
                .orElse("Sistema");
    }
}
