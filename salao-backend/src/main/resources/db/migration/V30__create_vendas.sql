CREATE TABLE vendas (
    id              BIGSERIAL     PRIMARY KEY,
    numero_venda    VARCHAR(20)   UNIQUE,
    data_venda      DATE          NOT NULL,
    valor_total     DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacao      VARCHAR(500),
    status          VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO',
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP,
    cliente_id      BIGINT        REFERENCES clientes(id)
);
