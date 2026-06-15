CREATE TABLE notas_fiscais_servico (
    id              BIGSERIAL     PRIMARY KEY,
    numero_nota     VARCHAR(20),
    serie           VARCHAR(5),
    data_emissao    TIMESTAMP     NOT NULL DEFAULT NOW(),
    valor_total     DECIMAL(10,2),
    observacao      VARCHAR(500),
    agendamento_id  BIGINT        UNIQUE REFERENCES agendamentos(id),
    cliente_id      BIGINT        REFERENCES clientes(id)
);
