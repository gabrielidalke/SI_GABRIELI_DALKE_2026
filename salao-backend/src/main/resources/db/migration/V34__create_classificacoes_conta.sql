CREATE TABLE classificacoes_conta (
    id              BIGSERIAL     PRIMARY KEY,
    nome            VARCHAR(60)   NOT NULL UNIQUE,
    ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP
);

INSERT INTO classificacoes_conta (nome) VALUES
    ('Mercadoria para Revenda'),
    ('Material de Uso e Consumo'),
    ('Ativo Imobilizado'),
    ('Serviço Contratado');
