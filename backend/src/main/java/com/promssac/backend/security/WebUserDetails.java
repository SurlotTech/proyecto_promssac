package com.promssac.backend.security;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Getter
public class WebUserDetails implements UserDetails {

    private final String id;
    private final String username;
    private final String password;
    private final String nombreCompleto;
    private final String email;
    private final String rolNombre;
    private final Map<String, Boolean> permissions;
    private final boolean activo;

    public WebUserDetails(String id, String username, String password, String nombreCompleto,
                          String email, String rolNombre, Map<String, Boolean> permissions, boolean activo) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.rolNombre = rolNombre;
        this.permissions = Map.copyOf(permissions);
        this.activo = activo;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return activo;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
