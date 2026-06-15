CREATE TABLE estados (
    id               BIGSERIAL    PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    uf               VARCHAR(2)   NOT NULL UNIQUE,
    ativo            BOOLEAN      DEFAULT true,
    data_criacao     TIMESTAMP    DEFAULT NOW(),
    data_atualizacao TIMESTAMP,
    pais_id          BIGINT       REFERENCES paises(id)
);
