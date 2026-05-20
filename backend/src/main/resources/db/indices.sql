-- ============================================================
-- Índices para PROMSSAC - Ejecutar en producción una sola vez
-- ============================================================

-- Notificaciones enviadas
CREATE INDEX IF NOT EXISTS idx_notif_enviadas_enviado_en ON notificaciones_enviadas (enviado_en DESC);
CREATE INDEX IF NOT EXISTS idx_notif_enviadas_dest_email ON notificaciones_enviadas (destinatario_email);
CREATE INDEX IF NOT EXISTS idx_notif_enviadas_orden_cod ON notificaciones_enviadas (orden_codigo);
CREATE INDEX IF NOT EXISTS idx_notif_enviadas_estado ON notificaciones_enviadas (estado);

-- Órdenes
CREATE INDEX IF NOT EXISTS idx_ordenes_ruta_id ON ordenes (ruta_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_id ON ordenes (cliente_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_vehiculo_id ON ordenes (vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes (estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_ruta ON ordenes (fecha_ruta);

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes (nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes (activo);

-- Clientes: autocomplete rápido (LIKE '%texto%' en email + nombre + director)
-- Requiere extensión pg_trgm habilitada en la BD
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_clientes_email_trgm ON clientes USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre_trgm ON clientes USING gin (nombre gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clientes_director_trgm ON clientes USING gin (nombre_apellidos_director_iiee gin_trgm_ops);

-- Vehículos
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos (placa);

-- Rutas
CREATE INDEX IF NOT EXISTS idx_rutas_fecha_entrega ON rutas (fecha_entrega);

-- Usuarios web
CREATE INDEX IF NOT EXISTS idx_usuarios_web_email ON usuarios_web (email);
