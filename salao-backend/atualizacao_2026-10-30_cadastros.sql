-- Atualização do banco salao_db (30/10/2026): cadastros no padrão do projeto de referência.
-- Para bancos que já aplicaram as atualizações anteriores. NÃO apaga dados: adiciona colunas, cria a tabela
-- de funções e renomeia "cpf" para "cpf_cnpj" em clientes e funcionários (os valores continuam lá).
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-30_cadastros.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)
-- IMPORTANTE: rode ANTES de subir o backend novo (o Hibernate valida as colunas na inicialização).

-- 1) Fornecedores: tipo de pessoa e os campos que a tela já tinha mas não eram gravados
ALTER TABLE fornecedores
    ADD COLUMN tipo_pessoa         VARCHAR(8)   NOT NULL DEFAULT 'JURIDICA' CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    ADD COLUMN nome_fantasia       VARCHAR(150),
    ADD COLUMN rg                  VARCHAR(20),
    ADD COLUMN insc_est_subst_trib VARCHAR(20),
    ADD COLUMN inscricao_municipal VARCHAR(20),
    ADD COLUMN numero              VARCHAR(10),
    ADD COLUMN complemento         VARCHAR(100),
    ADD COLUMN celular             VARCHAR(15),
    ADD COLUMN email               VARCHAR(150),
    ADD COLUMN contato             VARCHAR(100),
    ADD COLUMN site                VARCHAR(150),
    ADD COLUMN observacao          VARCHAR(500);
-- quem já está cadastrado com CPF (11 dígitos) é pessoa física
UPDATE fornecedores SET tipo_pessoa = 'FISICA'
    WHERE length(regexp_replace(coalesce(cpf_cnpj, ''), '[^0-9]', '', 'g')) = 11;

-- 2) Transportadoras: mesmo padrão do fornecedor
ALTER TABLE transportadoras
    ADD COLUMN tipo_pessoa         VARCHAR(8)   NOT NULL DEFAULT 'JURIDICA' CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    ADD COLUMN nome_fantasia       VARCHAR(150),
    ADD COLUMN rg                  VARCHAR(20),
    ADD COLUMN inscricao_estadual  VARCHAR(20),
    ADD COLUMN insc_est_subst_trib VARCHAR(20),
    ADD COLUMN numero              VARCHAR(10),
    ADD COLUMN complemento         VARCHAR(100),
    ADD COLUMN email               VARCHAR(150),
    ADD COLUMN site                VARCHAR(150);
UPDATE transportadoras SET tipo_pessoa = 'FISICA'
    WHERE length(regexp_replace(coalesce(cpf_cnpj, ''), '[^0-9]', '', 'g')) = 11;

-- 3) Clientes: CPF ou CNPJ conforme o tipo, inscrição estadual, condição de pagamento e limite de crédito
ALTER TABLE clientes RENAME COLUMN cpf TO cpf_cnpj;
ALTER TABLE clientes ALTER COLUMN cpf_cnpj TYPE VARCHAR(18);
ALTER TABLE clientes
    ADD COLUMN tipo_pessoa           VARCHAR(8)    NOT NULL DEFAULT 'FISICA' CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    ADD COLUMN inscricao_estadual    VARCHAR(20),
    ADD COLUMN condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id),
    ADD COLUMN limite_credito        DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (limite_credito >= 0);
-- (clientes já cadastrados ficam sem condição; a tela pede a condição na próxima edição)

-- 4) Funções (cargo do funcionário com salário base)
CREATE TABLE funcoes (
    id            BIGSERIAL     PRIMARY KEY,
    funcao        VARCHAR(60)   NOT NULL UNIQUE,
    salario_base  DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (salario_base >= 0),
    ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMP     NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP
);

-- 5) Funcionários: tipo de pessoa, CPF/CNPJ, RG, inscrição estadual e função
ALTER TABLE funcionarios RENAME COLUMN cpf TO cpf_cnpj;
ALTER TABLE funcionarios ALTER COLUMN cpf_cnpj TYPE VARCHAR(18);
ALTER TABLE funcionarios
    ADD COLUMN tipo_pessoa        VARCHAR(8)  NOT NULL DEFAULT 'FISICA' CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    ADD COLUMN rg                 VARCHAR(20),
    ADD COLUMN inscricao_estadual VARCHAR(20),
    ADD COLUMN funcao_id          BIGINT REFERENCES funcoes(id);
-- (funcionários já cadastrados ficam sem função; a tela pede a função na próxima edição)

-- 6) Ajustes menores
ALTER TABLE paises  ADD COLUMN ddi VARCHAR(6);
ALTER TABLE cidades ADD COLUMN ddd VARCHAR(3);
ALTER TABLE ncm_sh
    ADD COLUMN aliquota_icms DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (aliquota_icms BETWEEN 0 AND 100),
    ADD COLUMN aliquota_ipi  DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (aliquota_ipi BETWEEN 0 AND 100);
ALTER TABLE produtos
    ADD COLUMN peso_bruto        DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (peso_bruto >= 0),
    ADD COLUMN peso_liquido      DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (peso_liquido >= 0),
    ADD COLUMN quantidade_minima INT           NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0),
    ADD CONSTRAINT ck_produto_pesos CHECK (peso_liquido <= peso_bruto);
