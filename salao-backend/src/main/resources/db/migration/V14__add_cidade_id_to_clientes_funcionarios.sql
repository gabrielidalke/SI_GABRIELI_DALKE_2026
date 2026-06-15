ALTER TABLE clientes
    ADD COLUMN IF NOT EXISTS cidade_id BIGINT REFERENCES cidades(id);

ALTER TABLE funcionarios
    ADD COLUMN IF NOT EXISTS cidade_id BIGINT REFERENCES cidades(id);
