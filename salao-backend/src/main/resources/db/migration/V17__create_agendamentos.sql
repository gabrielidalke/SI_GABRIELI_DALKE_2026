CREATE TABLE agendamentos (
    id             BIGSERIAL       PRIMARY KEY,
    data_hora      TIMESTAMP       NOT NULL,
    observacao     VARCHAR(500),
    status         VARCHAR(20)     NOT NULL DEFAULT 'AGENDADO',
    valor_total    DECIMAL(10,2),
    criado_em      TIMESTAMP       NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMP,
    cliente_id     BIGINT          REFERENCES clientes(id),
    funcionario_id BIGINT          REFERENCES funcionarios(id)
);
