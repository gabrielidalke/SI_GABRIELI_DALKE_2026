CREATE TABLE paises (
    id               BIGSERIAL    PRIMARY KEY,
    pais             VARCHAR(100) NOT NULL,
    sigla            VARCHAR(3)   NOT NULL UNIQUE,
    moeda            VARCHAR(50),
    ativo            BOOLEAN      DEFAULT true,
    data_criacao     TIMESTAMP    DEFAULT NOW(),
    data_atualizacao TIMESTAMP
);
