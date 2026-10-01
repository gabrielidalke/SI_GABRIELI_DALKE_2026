ALTER TABLE compra_itens
    ADD COLUMN desconto_percentual   DECIMAL(5,2)  NOT NULL DEFAULT 0,
    ADD COLUMN desconto_valor        DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN rateio_custo          DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN classificacao_conta_id BIGINT REFERENCES classificacoes_conta(id);

UPDATE compra_itens ci
    SET classificacao_conta_id = (SELECT id FROM classificacoes_conta ORDER BY id LIMIT 1)
    WHERE classificacao_conta_id IS NULL;

ALTER TABLE compra_itens
    ALTER COLUMN classificacao_conta_id SET NOT NULL;
