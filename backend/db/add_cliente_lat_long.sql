-- Coordenadas opcionales del punto en mapa (WGS84) para el cliente.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS latitud NUMERIC(11, 8);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS longitud NUMERIC(11, 8);
