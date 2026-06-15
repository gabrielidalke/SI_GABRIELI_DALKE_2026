CREATE TABLE fornecedores (
    id          BIGSERIAL    PRIMARY KEY,
    fornecedor  VARCHAR(200) NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);
