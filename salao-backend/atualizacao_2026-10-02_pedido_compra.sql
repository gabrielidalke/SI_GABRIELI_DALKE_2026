-- Atualização do banco salao_db (02/10/2026): Pedido de Compra completo.
-- Para bancos que já aplicaram o atualizacao_2026-10-01_nota_entrada.sql. NÃO apaga dados: só adiciona colunas.
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-02_pedido_compra.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)

ALTER TABLE pedidos_compra
    ADD COLUMN condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id),
    ADD COLUMN valor_frete           DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_frete >= 0),
    ADD COLUMN valor_seguro          DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_seguro >= 0),
    ADD COLUMN outras_despesas       DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (outras_despesas >= 0);

-- classificação fica opcional no banco (pedidos antigos não têm); o sistema exige nos pedidos novos e nas edições
ALTER TABLE pedidos_compra_itens
    ADD COLUMN classificacao_conta_id BIGINT REFERENCES classificacoes_conta(id),
    ADD COLUMN desconto_percentual    DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK (desconto_percentual BETWEEN 0 AND 100),
    ADD COLUMN desconto_valor         DECIMAL(12,2) NOT NULL DEFAULT 0;
