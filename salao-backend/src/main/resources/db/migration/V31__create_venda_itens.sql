CREATE TABLE venda_itens (
    id              BIGSERIAL     PRIMARY KEY,
    quantidade      DECIMAL(10,3) NOT NULL,
    preco_unitario  DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    venda_id        BIGINT        NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id      BIGINT        REFERENCES produtos(id)
);
