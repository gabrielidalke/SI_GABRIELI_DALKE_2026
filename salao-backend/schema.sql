-- Script de criação do banco de dados do sistema Salão (SI_GABRIELI_DALKE_2026).
-- Criação manual do banco, conforme solicitado pelo professor da disciplina de
-- Sistemas de Informação (sem uso de ferramenta de migration automática).
--
-- Ordem das tabelas respeita as dependências de chave estrangeira.

CREATE DATABASE salao_db;

\c salao_db

-- ============================================================
-- Localização
-- ============================================================

CREATE TABLE paises (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL,
    sigla         VARCHAR(5),
    nacionalidade VARCHAR(100),
    moeda         VARCHAR(50),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE estados (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL,
    uf            VARCHAR(2)    NOT NULL UNIQUE,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    pais_id       BIGINT        NOT NULL REFERENCES paises(id)
);

CREATE TABLE cidades (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL,
    codigo_ibge   VARCHAR(10),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    estado_id     BIGINT        NOT NULL REFERENCES estados(id),
    CONSTRAINT uk_cidade_nome_estado UNIQUE (nome, estado_id)
);

-- ============================================================
-- Cadastros gerais
-- ============================================================

CREATE TABLE categorias (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(60)   NOT NULL UNIQUE,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE servicos (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(60)   NOT NULL UNIQUE,
    descricao     VARCHAR(255),
    duracao_min   INT           NOT NULL,
    preco         DECIMAL(10,2) NOT NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE marcas (
    id            BIGSERIAL     PRIMARY KEY,
    marca         VARCHAR(100)  NOT NULL,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE unidades_medida (
    id             BIGSERIAL     PRIMARY KEY,
    unidade_medida VARCHAR(100)  NOT NULL,
    sigla          VARCHAR(10)   NOT NULL,
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMP
);

CREATE TABLE ncm_sh (
    id            BIGSERIAL     PRIMARY KEY,
    codigo        VARCHAR(20)   NOT NULL UNIQUE,
    descricao     VARCHAR(200),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE classificacoes_conta (
    id            BIGSERIAL     PRIMARY KEY,
    nome          VARCHAR(60)   NOT NULL UNIQUE,
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

INSERT INTO classificacoes_conta (nome) VALUES
    ('Mercadoria para Revenda'),
    ('Material de Uso e Consumo'),
    ('Ativo Imobilizado'),
    ('Serviço Contratado');

-- ============================================================
-- Pessoas
-- ============================================================

CREATE TABLE clientes (
    id              BIGSERIAL    PRIMARY KEY,
    nome            VARCHAR(50)  NOT NULL,
    apelido         VARCHAR(60),
    email           VARCHAR(100),
    telefone        VARCHAR(20),
    endereco        VARCHAR(200),
    numero          VARCHAR(5),
    complemento     VARCHAR(100),
    bairro          VARCHAR(50),
    cep             VARCHAR(9),
    cpf             VARCHAR(14)  UNIQUE,
    rg              VARCHAR(14),
    data_nascimento DATE,
    sexo            VARCHAR(1),
    estado_civil    VARCHAR(20),
    observacao      VARCHAR(255),
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em       TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMP,
    cidade_id       BIGINT REFERENCES cidades(id)
);

CREATE TABLE funcionarios (
    id                  BIGSERIAL    PRIMARY KEY,
    nome                VARCHAR(100) NOT NULL,
    apelido             VARCHAR(60),
    email               VARCHAR(100) NOT NULL,
    telefone            VARCHAR(20)  NOT NULL,
    cpf                 VARCHAR(14)  UNIQUE,
    data_nascimento     DATE,
    data_admissao       DATE         NOT NULL,
    data_demissao       DATE,
    sexo                VARCHAR(1),
    estado_civil        VARCHAR(20),
    endereco            VARCHAR(200),
    numero              VARCHAR(5),
    complemento         VARCHAR(100),
    bairro              VARCHAR(50),
    cep                 VARCHAR(9),
    salario             DECIMAL(10,2),
    percentual_comissao DECIMAL(5,2) NOT NULL DEFAULT 0,
    observacao          VARCHAR(255),
    ativo               BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em           TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP,
    cidade_id           BIGINT REFERENCES cidades(id)
);

-- ============================================================
-- Financeiro / pagamento
-- ============================================================

CREATE TABLE formas_pagamento (
    id             BIGSERIAL     PRIMARY KEY,
    forma_pagamento VARCHAR(100) NOT NULL,
    percentual     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    numero_dias    INT           NOT NULL DEFAULT 0,
    ativo          BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em      TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMP
);

CREATE TABLE condicoes_pagamento (
    id            BIGSERIAL    PRIMARY KEY,
    condicao      VARCHAR(100) NOT NULL,
    multa         DECIMAL(5,2) NOT NULL DEFAULT 0,
    juro          DECIMAL(5,2) NOT NULL DEFAULT 0,
    desconto      DECIMAL(5,2) NOT NULL DEFAULT 0,
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

CREATE TABLE parcelas (
    id                    BIGSERIAL    PRIMARY KEY,
    numero_parcela        INT,
    dias_vencimento       INT          NOT NULL,
    percentual            DECIMAL(5,2) NOT NULL DEFAULT 0,
    ativo                 BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em             TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP,
    forma_pagamento_id    BIGINT REFERENCES formas_pagamento(id),
    condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id)
);

-- ============================================================
-- Fornecedores e produtos
-- ============================================================

CREATE TABLE fornecedores (
    id                    BIGSERIAL    PRIMARY KEY,
    fornecedor            VARCHAR(150) NOT NULL,
    cpf_cnpj              VARCHAR(18)  UNIQUE,
    endereco              VARCHAR(200),
    bairro                VARCHAR(100),
    cep                   VARCHAR(20),
    fone                  VARCHAR(20),
    inscricao_estadual    VARCHAR(30),
    ativo                 BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em             TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP,
    cidade_id             BIGINT REFERENCES cidades(id),
    condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id)
);

CREATE TABLE produtos (
    id                 BIGSERIAL     PRIMARY KEY,
    nome               VARCHAR(100)  NOT NULL UNIQUE,
    descricao          VARCHAR(255),
    preco_venda        DECIMAL(10,2) NOT NULL,
    preco_custo        DECIMAL(10,2),
    desconto           DECIMAL(5,2)  NOT NULL DEFAULT 0,
    quantidade         INT           NOT NULL DEFAULT 0,
    ativo              BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em          TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em      TIMESTAMP,
    marca_id           BIGINT REFERENCES marcas(id),
    unidade_medida_id  BIGINT REFERENCES unidades_medida(id),
    categoria_id       BIGINT REFERENCES categorias(id),
    ncm_sh_id          BIGINT REFERENCES ncm_sh(id)
);

-- ============================================================
-- Agendamentos
-- ============================================================

CREATE TABLE agendamentos (
    id             BIGSERIAL     PRIMARY KEY,
    data_hora      TIMESTAMP     NOT NULL,
    observacao     VARCHAR(500),
    status         VARCHAR(20)   NOT NULL DEFAULT 'AGENDADO',
    valor_total    DECIMAL(10,2),
    criado_em      TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em  TIMESTAMP,
    cliente_id     BIGINT REFERENCES clientes(id),
    funcionario_id BIGINT REFERENCES funcionarios(id)
);

CREATE TABLE agendamento_servicos (
    agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    servico_id     BIGINT NOT NULL REFERENCES servicos(id),
    PRIMARY KEY (agendamento_id, servico_id)
);

CREATE TABLE transportadoras (
    id            BIGSERIAL    PRIMARY KEY,
    nome          VARCHAR(150) NOT NULL,
    cpf_cnpj      VARCHAR(18),
    fone          VARCHAR(20),
    endereco      VARCHAR(200),
    bairro        VARCHAR(100),
    cep           VARCHAR(20),
    ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    cidade_id     BIGINT REFERENCES cidades(id)
);

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
    condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id),   -- vem do fornecedor, pode ser trocada
    valor_frete     DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_frete >= 0),
    valor_seguro    DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_seguro >= 0),
    outras_despesas DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (outras_despesas >= 0),
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
    classificacao_conta_id BIGINT     REFERENCES classificacoes_conta(id),   -- obrigatória nos pedidos novos (a nota herda)
    quantidade          DECIMAL(10,3) NOT NULL CHECK (quantidade > 0),
    valor_unitario      DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
    desconto_percentual DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK (desconto_percentual BETWEEN 0 AND 100),
    desconto_valor      DECIMAL(12,2) NOT NULL DEFAULT 0,
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
-- Vendas
-- ============================================================

CREATE TABLE vendas (
    id                    BIGSERIAL     PRIMARY KEY,
    numero_venda          VARCHAR(20)   UNIQUE,
    data_venda            DATE          NOT NULL,
    valor_total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacao            VARCHAR(500),
    status                VARCHAR(20)   NOT NULL DEFAULT 'RASCUNHO',
    criado_em             TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP,
    cliente_id            BIGINT REFERENCES clientes(id),
    condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id)
);

CREATE TABLE venda_itens (
    id             BIGSERIAL     PRIMARY KEY,
    quantidade     DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal       DECIMAL(10,2) NOT NULL,
    venda_id       BIGINT        NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id     BIGINT REFERENCES produtos(id)
);

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
    venda_id            BIGINT UNIQUE REFERENCES vendas(id),
    cliente_id          BIGINT REFERENCES clientes(id)
);

CREATE TABLE notas_fiscais_servico (
    id             BIGSERIAL     PRIMARY KEY,
    numero_nota    VARCHAR(20),
    serie          VARCHAR(5),
    data_emissao   TIMESTAMP     NOT NULL DEFAULT NOW(),
    valor_total    DECIMAL(10,2),
    observacao     VARCHAR(500),
    agendamento_id BIGINT UNIQUE REFERENCES agendamentos(id),
    cliente_id     BIGINT REFERENCES clientes(id)
);

-- ============================================================
-- Financeiro — contas
-- ============================================================

CREATE TABLE contas_pagar (
    id                     BIGSERIAL     PRIMARY KEY,
    descricao              VARCHAR(200),
    valor                  DECIMAL(10,2) NOT NULL,
    data_vencimento        DATE          NOT NULL,
    data_pagamento         DATE,
    -- termos da condição de pagamento, copiados no lançamento
    percentual_desconto    DECIMAL(5,2)  NOT NULL DEFAULT 0,
    percentual_multa       DECIMAL(5,2)  NOT NULL DEFAULT 0,
    percentual_juro        DECIMAL(5,2)  NOT NULL DEFAULT 0,
    -- resultado da baixa: desconto se pago até o vencimento; multa + juro/mês pro rata se pago depois
    valor_desconto         DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_multa            DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_juro             DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_pago             DECIMAL(10,2),
    situacao               VARCHAR(20)   NOT NULL DEFAULT 'ABERTA',
    ativo                  BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em              TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em          TIMESTAMP,
    fornecedor_id          BIGINT REFERENCES fornecedores(id),
    parcela_id             BIGINT REFERENCES parcelas(id),
    -- Nota de Entrada que originou a conta (chave composta; nulos = conta lançada manualmente)
    nota_numero            INTEGER,
    nota_serie             INTEGER,
    nota_modelo            INTEGER,
    nota_fornecedor_id     BIGINT,
    FOREIGN KEY (nota_numero, nota_serie, nota_modelo, nota_fornecedor_id)
        REFERENCES notas_entrada (numero, serie, modelo, fornecedor_id)
);

CREATE TABLE contas_receber (
    id                   BIGSERIAL     PRIMARY KEY,
    descricao            VARCHAR(200),
    valor                DECIMAL(10,2) NOT NULL,
    data_vencimento      DATE          NOT NULL,
    data_recebimento     DATE,
    -- termos da condição de pagamento, copiados no lançamento
    percentual_desconto  DECIMAL(5,2)  NOT NULL DEFAULT 0,
    percentual_multa     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    percentual_juro      DECIMAL(5,2)  NOT NULL DEFAULT 0,
    -- resultado da baixa: desconto se recebido até o vencimento; multa + juro/mês pro rata se depois
    valor_desconto       DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_multa          DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_juro           DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_recebido       DECIMAL(10,2),
    situacao             VARCHAR(20)   NOT NULL DEFAULT 'ABERTA',
    ativo                BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em            TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em        TIMESTAMP,
    cliente_id           BIGINT REFERENCES clientes(id),
    parcela_id           BIGINT REFERENCES parcelas(id),
    nota_fiscal_saida_id BIGINT REFERENCES notas_fiscais_saida(id)
);

-- ============================================================
-- Estoque
-- ============================================================

-- Histórico (ledger) de entradas e saídas. A entrada só é registrada na CONFIRMAÇÃO da Nota de Entrada.
CREATE TABLE movimentacoes_estoque (
    id               BIGSERIAL     PRIMARY KEY,
    produto_id       BIGINT        NOT NULL REFERENCES produtos(id),
    tipo             VARCHAR(10)   NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade       DECIMAL(10,3) NOT NULL,
    saldo_anterior   INTEGER,
    saldo_resultante INTEGER       NOT NULL,   -- saldo posterior ao movimento
    custo_unitario   DECIMAL(12,4),
    origem_tipo      VARCHAR(20),              -- NOTA_ENTRADA, VENDA
    origem_id        BIGINT,
    documento        VARCHAR(120),             -- ex.: "Entrada da Nota 12345/1 - Fornecedor 10"
    criado_em        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movimentacoes_estoque_produto ON movimentacoes_estoque (produto_id);

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
