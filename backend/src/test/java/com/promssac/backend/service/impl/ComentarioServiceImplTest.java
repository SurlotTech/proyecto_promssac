package com.promssac.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.promssac.backend.model.dto.response.ComentarioResponse;
import com.promssac.backend.model.entity.ComentarioOrden;
import com.promssac.backend.model.entity.Orden;
import com.promssac.backend.repository.ComentarioOrdenRepository;
import com.promssac.backend.repository.OrdenRepository;
import com.promssac.backend.security.CurrentUserProvider;
import com.promssac.backend.service.FileStorageService;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

@ExtendWith(MockitoExtension.class)
class ComentarioServiceImplTest {

    @Mock
    private ComentarioOrdenRepository comentarioRepository;

    @Mock
    private OrdenRepository ordenRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private ComentarioServiceImpl service;

    @Test
    void agregarConArchivoGuardaArchivoUrlEnComentario() {
        Orden orden = new Orden();
        orden.setId(UUID.randomUUID());
        orden.setNumeroOrden("ORD-001");

        String storedReference = "comentarios/evidencia.pdf";
        String publicUrl = "https://minio.rakiweb.com/promssac-evidencias/comentarios/evidencia.pdf?X-Amz-Signature=test";
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo",
                "evidencia.pdf",
                "application/pdf",
                "contenido".getBytes());

        when(ordenRepository.findByNumeroOrden("ORD-001")).thenReturn(Optional.of(orden));
        when(currentUserProvider.currentUserNameOrSystem()).thenReturn("Operador PROMSSAC");
        when(fileStorageService.storeComentario(archivo))
                .thenReturn(new FileStorageService.StoredFile("evidencia.pdf", storedReference, publicUrl));
        when(fileStorageService.publicComentarioUrl(storedReference)).thenReturn(publicUrl);
        when(comentarioRepository.save(any(ComentarioOrden.class))).thenAnswer(invocation -> {
            ComentarioOrden comentario = invocation.getArgument(0);
            comentario.setId(UUID.randomUUID());
            if (comentario.getCreadoEn() == null) {
                comentario.setCreadoEn(Instant.now());
            }
            return comentario;
        });

        ComentarioResponse response = service.agregar(" ORD-001 ", " Entrega validada ", archivo);

        ArgumentCaptor<ComentarioOrden> captor = ArgumentCaptor.forClass(ComentarioOrden.class);
        verify(comentarioRepository).save(captor.capture());
        ComentarioOrden guardado = captor.getValue();

        assertThat(guardado.getOrden()).isSameAs(orden);
        assertThat(guardado.getTexto()).isEqualTo("Entrega validada");
        assertThat(guardado.getCreadoPor()).isEqualTo("Operador PROMSSAC");
        assertThat(guardado.getArchivoUrl()).isEqualTo(storedReference);
        assertThat(response.getArchivoUrl()).isEqualTo(publicUrl);
    }
}
