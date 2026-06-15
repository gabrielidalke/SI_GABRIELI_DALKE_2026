CREATE TABLE cidades (
    id               BIGSERIAL    PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    ativo            BOOLEAN      DEFAULT true,
    data_criacao     TIMESTAMP    DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    estado_id        BIGINT       REFERENCES estados(id)
);
