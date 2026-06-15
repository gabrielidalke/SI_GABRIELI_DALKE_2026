CREATE TABLE ncm_sh (
    id            BIGSERIAL    PRIMARY KEY,
    codigo        VARCHAR(20)  NOT NULL UNIQUE,
    descricao     VARCHAR(200),
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);
