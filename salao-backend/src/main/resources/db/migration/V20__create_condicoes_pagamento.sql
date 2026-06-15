CREATE TABLE condicoes_pagamento (
    id            BIGSERIAL    PRIMARY KEY,
    condicao      VARCHAR(100) NOT NULL,
    multa         DECIMAL(5,2) NOT NULL DEFAULT 0,
    desconto      DECIMAL(5,2) NOT NULL DEFAULT 0,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);
