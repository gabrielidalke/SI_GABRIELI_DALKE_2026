CREATE TABLE movimentacoes_estoque (
    id               BIGSERIAL     PRIMARY KEY,
    produto_id       BIGINT        NOT NULL REFERENCES produtos(id),
    tipo             VARCHAR(10)   NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade       DECIMAL(10,3) NOT NULL,
    saldo_resultante INTEGER       NOT NULL,
    origem_tipo      VARCHAR(20),
    origem_id        BIGINT,
    criado_em        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movimentacoes_estoque_produto ON movimentacoes_estoque (produto_id);
