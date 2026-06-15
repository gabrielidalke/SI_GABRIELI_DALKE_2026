CREATE TABLE notas_fiscais_saida (
    id                  BIGSERIAL     PRIMARY KEY,
    numero_nota         VARCHAR(20),
    serie               VARCHAR(5),
    data_emissao        TIMESTAMP     NOT NULL DEFAULT NOW(),
    chave_acesso        VARCHAR(50),
    valor_total         DECIMAL(10,2),
    transportadora_nome VARCHAR(150),
    veiculo_placa       VARCHAR(10),
    observacao          VARCHAR(500),
    venda_id            BIGINT        UNIQUE REFERENCES vendas(id),
    cliente_id          BIGINT        REFERENCES clientes(id)
);
