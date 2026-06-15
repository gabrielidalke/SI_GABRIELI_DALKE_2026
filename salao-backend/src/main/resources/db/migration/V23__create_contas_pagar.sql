CREATE TABLE contas_pagar (
    id              BIGSERIAL     PRIMARY KEY,
    descricao       VARCHAR(200),
    valor           DECIMAL(10,2) NOT NULL,
    data_vencimento DATE          NOT NULL,
    data_pagamento  DATE,
    situacao        VARCHAR(20)   NOT NULL DEFAULT 'ABERTA',
    ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP,
    fornecedor_id   BIGINT        REFERENCES fornecedores(id),
    parcela_id      BIGINT        REFERENCES parcelas(id)
);
