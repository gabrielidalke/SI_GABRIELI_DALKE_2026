CREATE TABLE contas_receber (
    id               BIGSERIAL     PRIMARY KEY,
    descricao        VARCHAR(200),
    valor            DECIMAL(10,2) NOT NULL,
    data_vencimento  DATE          NOT NULL,
    data_recebimento DATE,
    situacao         VARCHAR(20)   NOT NULL DEFAULT 'ABERTA',
    ativo            BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em        TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em    TIMESTAMP,
    cliente_id       BIGINT        REFERENCES clientes(id),
    parcela_id       BIGINT        REFERENCES parcelas(id)
);
