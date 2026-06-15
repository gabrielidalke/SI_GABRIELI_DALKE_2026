CREATE TABLE compras (
    id              BIGSERIAL     PRIMARY KEY,
    numero_compra   VARCHAR(20)   UNIQUE,
    data_compra     DATE          NOT NULL,
    valor_total     DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacao      VARCHAR(500),
    status          VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO',
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP,
    fornecedor_id   BIGINT        REFERENCES fornecedores(id)
);
