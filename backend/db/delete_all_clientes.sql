-- Borra todos los registros de clientes. Primero se anula el FK en órdenes.
UPDATE ordenes SET cliente_id = NULL WHERE cliente_id IS NOT NULL;

DELETE FROM clientes;
