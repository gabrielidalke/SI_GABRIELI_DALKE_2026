ALTER TABLE compras
    ADD COLUMN modelo_nota          VARCHAR(20),
    ADD COLUMN serie_nota           VARCHAR(5),
    ADD COLUMN numero_nota          VARCHAR(20),
    ADD COLUMN data_chegada         DATE,
    ADD COLUMN frete                DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN seguro               DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN outros_gastos        DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN transportadora_id    BIGINT REFERENCES fornecedores(id),
    ADD COLUMN condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id);

UPDATE compras SET data_chegada = data_compra WHERE data_chegada IS NULL;
UPDATE compras SET modelo_nota = '-' WHERE modelo_nota IS NULL;
UPDATE compras SET serie_nota = '-' WHERE serie_nota IS NULL;
UPDATE compras SET numero_nota = numero_compra WHERE numero_nota IS NULL;

ALTER TABLE compras
    ALTER COLUMN data_chegada SET NOT NULL,
    ALTER COLUMN modelo_nota SET NOT NULL,
    ALTER COLUMN serie_nota SET NOT NULL,
    ALTER COLUMN numero_nota SET NOT NULL;

CREATE UNIQUE INDEX uk_compras_nota_fornecedor
    ON compras (fornecedor_id, modelo_nota, serie_nota, numero_nota);
