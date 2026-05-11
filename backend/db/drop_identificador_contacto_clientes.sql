-- Una vez despues del despliegue del codigo sin el campo `identificador_contacto`.
ALTER TABLE clientes DROP COLUMN IF EXISTS identificador_contacto;
