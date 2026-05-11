-- Enlaza órdenes al catálogo por nombre coincidente (trim + minúsculas) y elimina la columna redundante cliente_nombre.
-- Ejecutar una vez contra la misma base que usa la aplicación.

ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes (id);

UPDATE ordenes o
SET cliente_id = sub.cid
FROM (
    SELECT o2.id AS oid,
           (SELECT c.id
            FROM clientes c
            WHERE lower(trim(coalesce(o2.cliente_nombre, ''))) = lower(trim(coalesce(c.nombre, '')))
            ORDER BY c.creado_en ASC NULLS LAST
            LIMIT 1) AS cid
    FROM ordenes o2
    WHERE o2.cliente_nombre IS NOT NULL
      AND trim(o2.cliente_nombre) <> ''
) AS sub
WHERE o.id = sub.oid
  AND sub.cid IS NOT NULL;

ALTER TABLE ordenes DROP COLUMN IF EXISTS cliente_nombre;
