CREATE TABLE formas_pagamento (
    id              BIGSERIAL    PRIMARY KEY,
    forma_pagamento VARCHAR(100) NOT NULL,
    percentual      DECIMAL(5,2) NOT NULL DEFAULT 0,
    numero_dias     INTEGER      NOT NULL DEFAULT 0,
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP
);
