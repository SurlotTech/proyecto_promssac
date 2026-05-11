-- Ejecutar una vez en Postgres si no usás solo Hibernate ddl-auto=update creando columnas nuevas.

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS nombre_apellidos_director_iiee VARCHAR(200);
