CREATE TABLE agendamento_servicos (
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id     BIGINT NOT NULL REFERENCES servicos(id),
    PRIMARY KEY (agendamento_id, servico_id)
);
