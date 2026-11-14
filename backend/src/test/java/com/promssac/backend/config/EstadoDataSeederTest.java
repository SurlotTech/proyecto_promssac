package com.promssac.backend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.promssac.backend.model.entity.Estado;
import com.promssac.backend.repository.EstadoRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import org.junit.jupiter.api.Test;

class EstadoDataSeederTest {

    @Test
    void emptyDatabaseGetsUniqueStatesAndValidParents() {
        EstadoRepository repository = mock(EstadoRepository.class);
        List<Estado> saved = new ArrayList<>();
        when(repository.save(any(Estado.class))).thenAnswer(invocation -> {
            Estado estado = invocation.getArgument(0);
            saved.add(estado);
            return estado;
        });

        new EstadoDataSeeder(repository).run(null);

        assertEquals(8, saved.size());
        assertEquals(saved.size(), new HashSet<>(saved.stream().map(Estado::getNombre).toList()).size());
        assertEquals(4, saved.stream().filter(Estado::esPadre).count());
        assertTrue(saved.stream().filter(e -> !e.esPadre())
                .allMatch(e -> saved.contains(e.getParent()) && e.getParent().esPadre()));
    }

    @Test
    void existingStatesAreNotChanged() {
        EstadoRepository repository = mock(EstadoRepository.class);
        when(repository.count()).thenReturn(8L);

        new EstadoDataSeeder(repository).run(null);

        verify(repository, never()).save(any(Estado.class));
    }
}
