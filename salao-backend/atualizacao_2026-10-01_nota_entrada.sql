-- Atualização do banco salao_db para o módulo NOTA DE ENTRADA (01/10/2026).
-- Para bancos já criados com o schema.sql anterior. NÃO apaga dados: só adiciona tabelas e colunas.
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-01_nota_entrada.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)

-- ============================================================
-- Pedido de Compra e Nota de Entrada
-- Ambos usam CHAVE COMPOSTA (numero, serie, modelo, fornecedor): não existe ID artificial.
-- ============================================================

CREATE TABLE pedidos_compra (
    numero        INTEGER      NOT NULL CHECK (numero > 0),
    serie         INTEGER      NOT NULL CHECK (serie > 0),
    modelo        INTEGER      NOT NULL CHECK (modelo > 0),
    fornecedor_id BIGINT       NOT NULL REFERENCES fornecedores(id),
    data_pedido   DATE         NOT NULL,
    observacoes   VARCHAR(500),
    -- ABERTA: nada recebido | PARCIAL: algo recebido | CONCLUIDA: tudo recebido
    situacao      VARCHAR(10)  NOT NULL DEFAULT 'ABERTA' CHECK (situacao IN ('ABERTA', 'PARCIAL', 'CONCLUIDA')),
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    PRIMARY KEY (numero, serie, modelo, fornecedor_id)
);

CREATE TABLE pedidos_compra_itens (
    numero              INTEGER       NOT NULL,
    serie               INTEGER       NOT NULL,
    modelo              INTEGER       NOT NULL,
    fornecedor_id       BIGINT        NOT NULL,
    produto_id          BIGINT        NOT NULL REFERENCES produtos(id),
    quantidade          DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    valor_unitario      DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    quantidade_recebida DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (quantidade_recebida >= 0),
    PRIMARY KEY (numero, serie, modelo, fornecedor_id, produto_id),
    FOREIGN KEY (numero, serie, modelo, fornecedor_id)
        REFERENCES pedidos_compra (numero, serie, modelo, fornecedor_id) ON DELETE CASCADE
);

CREATE TABLE notas_entrada (
    numero                INTEGER       NOT NULL CHECK (numero > 0),
    serie                 INTEGER       NOT NULL CHECK (serie > 0),
    modelo                INTEGER       NOT NULL CHECK (modelo > 0),
    fornecedor_id         BIGINT        NOT NULL REFERENCES fornecedores(id),
    data_emissao          DATE          NOT NULL,
    data_chegada          DATE,
    tipo_frete            VARCHAR(3)    CHECK (tipo_frete IN ('CIF', 'FOB')),
    valor_produtos        DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_frete           DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_frete >= 0),
    valor_seguro          DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_seguro >= 0),
    outras_despesas       DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (outras_despesas >= 0),
    valor_desconto        DECIMAL(12,2) NOT NULL DEFAULT 0,
    valor_total           DECIMAL(12,2) NOT NULL DEFAULT 0,
    condicao_pagamento_id BIGINT        REFERENCES condicoes_pagamento(id),
    transportadora_id     BIGINT        REFERENCES transportadoras(id),
    placa_veiculo         VARCHAR(10),
    observacoes           VARCHAR(500),
    -- PENDENTE: pode editar, excluir e confirmar | CONFERIDA: efetivada (estoque e contas a pagar gerados)
    situacao              VARCHAR(10)   NOT NULL DEFAULT 'PENDENTE' CHECK (situacao IN ('PENDENTE', 'CONFERIDA')),
    -- Pedido de Compra de origem (opcional): os três campos juntos, ou nenhum
    pedido_numero         INTEGER,
    pedido_serie          INTEGER,
    pedido_modelo         INTEGER,
    criado_em             TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP,
    PRIMARY KEY (numero, serie, modelo, fornecedor_id),
    CONSTRAINT ck_nota_entrada_chegada CHECK (data_chegada IS NULL OR data_chegada >= data_emissao),
    CONSTRAINT ck_nota_entrada_pedido CHECK (
        (pedido_numero IS NULL AND pedido_serie IS NULL AND pedido_modelo IS NULL)
        OR (pedido_numero IS NOT NULL AND pedido_serie IS NOT NULL AND pedido_modelo IS NOT NULL)),
    -- inclui fornecedor_id: o pedido tem que ser do mesmo fornecedor da nota
    CONSTRAINT fk_nota_entrada_pedido FOREIGN KEY (pedido_numero, pedido_serie, pedido_modelo, fornecedor_id)
        REFERENCES pedidos_compra (numero, serie, modelo, fornecedor_id)
);

CREATE TABLE notas_entrada_itens (
    numero                 INTEGER       NOT NULL,
    serie                  INTEGER       NOT NULL,
    modelo                 INTEGER       NOT NULL,
    fornecedor_id          BIGINT        NOT NULL,
    produto_id             BIGINT        NOT NULL REFERENCES produtos(id),
    classificacao_conta_id BIGINT        NOT NULL REFERENCES classificacoes_conta(id),
    quantidade             DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    valor_unitario         DECIMAL(12,2) NOT NULL CHECK (valor_unitario >= 0),
    valor_total            DECIMAL(12,2) NOT NULL,
    desconto_percentual    DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK (desconto_percentual BETWEEN 0 AND 100),
    desconto_valor         DECIMAL(12,2) NOT NULL DEFAULT 0,
    rateio_frete           DECIMAL(12,2) NOT NULL DEFAULT 0,
    rateio_seguro          DECIMAL(12,2) NOT NULL DEFAULT 0,
    rateio_outras          DECIMAL(12,2) NOT NULL DEFAULT 0,
    -- custo UNITÁRIO que alimenta o estoque: (valor_total - desconto + rateios) / quantidade
    custo_final            DECIMAL(12,4) NOT NULL DEFAULT 0,
    PRIMARY KEY (numero, serie, modelo, fornecedor_id, produto_id),
    FOREIGN KEY (numero, serie, modelo, fornecedor_id)
        REFERENCES notas_entrada (numero, serie, modelo, fornecedor_id) ON DELETE CASCADE
);


-- ============================================================
-- Contas a pagar: agora apontam para a chave composta da Nota de Entrada
-- ============================================================

ALTER TABLE contas_pagar
    ADD COLUMN nota_numero        INTEGER,
    ADD COLUMN nota_serie         INTEGER,
    ADD COLUMN nota_modelo        INTEGER,
    ADD COLUMN nota_fornecedor_id BIGINT,
    ADD CONSTRAINT fk_contas_pagar_nota_entrada FOREIGN KEY (nota_numero, nota_serie, nota_modelo, nota_fornecedor_id)
        REFERENCES notas_entrada (numero, serie, modelo, fornecedor_id);

-- ============================================================
-- Estoque: histórico passa a guardar saldo anterior, custo e documento de origem
-- ============================================================

ALTER TABLE movimentacoes_estoque
    ADD COLUMN saldo_anterior INTEGER,
    ADD COLUMN custo_unitario DECIMAL(12,4),
    ADD COLUMN documento      VARCHAR(120);

-- ============================================================
-- Log de ações (CRIOU, EDITOU, CONFIRMOU, EXCLUIU)
-- ============================================================

CREATE TABLE logs_sistema (
    id        BIGSERIAL    PRIMARY KEY,
    entidade  VARCHAR(40)  NOT NULL,
    acao      VARCHAR(20)  NOT NULL,
    descricao VARCHAR(300),
    criado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OPCIONAL: as tabelas do fluxo antigo (Compra + NF-e de Entrada automática) deixaram de ser usadas
-- pelo sistema. Elas continuam no banco com os dados de teste antigos. Para removê-las:
--
--   ALTER TABLE contas_pagar DROP COLUMN nota_fiscal_entrada_id;
--   DROP TABLE notas_fiscais_entrada;
--   DROP TABLE compra_itens;
--   DROP TABLE compras;
-- ============================================================
