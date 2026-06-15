CREATE TABLE compra_itens (
    id              BIGSERIAL     PRIMARY KEY,
    quantidade      DECIMAL(10,3) NOT NULL,
    preco_unitario  DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    compra_id       BIGINT        NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    produto_id      BIGINT        REFERENCES produtos(id)
);
