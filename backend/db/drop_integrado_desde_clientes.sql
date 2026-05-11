-- Una sola vez, después del despliegue del código sin el campo `integrado`.
-- Hibernate con ddl-auto=update no suele eliminar columnas; conviene ejecutar esto manualmente.

ALTER TABLE clientes DROP COLUMN IF EXISTS integrado;
