CREATE DATABASE salao_db;

\c salao_db

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

CREATE TABLE produtos (
                          id              BIGSERIAL       PRIMARY KEY,
                          nome            VARCHAR(100)    NOT NULL UNIQUE,
                          descricao       VARCHAR(255),
                          preco           DECIMAL(10,2)   NOT NULL,
                          quantidade      INT             NOT NULL DEFAULT 0,
                          ativo           BOOLEAN         NOT NULL DEFAULT TRUE,
                          criado_em       TIMESTAMP       NOT NULL DEFAULT NOW(),
                          atualizado_em   TIMESTAMP
);

CREATE TABLE clientes (
                          id                  BIGSERIAL       PRIMARY KEY,
                          nome                VARCHAR(50)     NOT NULL,
                          apelido             VARCHAR(60),
                          email               VARCHAR(100),
                          telefone            VARCHAR(20),
                          endereco            VARCHAR(200),
                          numero              VARCHAR(5),
                          complemento         VARCHAR(100),
                          bairro              VARCHAR(50),
                          cep                 VARCHAR(9),
                          cpf                 VARCHAR(14)     UNIQUE,
                          rg                  VARCHAR(14),
                          data_nascimento     DATE,
                          sexo                VARCHAR(1),
                          estado_civil        VARCHAR(20),
                          observacao          VARCHAR(255),
                          ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
                          criado_em           TIMESTAMP       NOT NULL DEFAULT NOW(),
                          atualizado_em       TIMESTAMP
);

CREATE TABLE funcionarios (
                              id                  BIGSERIAL       PRIMARY KEY,
                              nome                VARCHAR(100)    NOT NULL,
                              apelido             VARCHAR(60),
                              email               VARCHAR(100)    NOT NULL,
                              telefone            VARCHAR(20)     NOT NULL,
                              cpf                 VARCHAR(14)     UNIQUE,
                              data_nascimento     DATE,
                              data_admissao       DATE            NOT NULL,
                              data_demissao       DATE,
                              sexo                VARCHAR(1),
                              estado_civil        VARCHAR(20),
                              endereco            VARCHAR(200),
                              numero              VARCHAR(5),
                              complemento         VARCHAR(100),
                              bairro              VARCHAR(50),
                              cep                 VARCHAR(9),
                              salario             DECIMAL(10,2),
                              percentual_comissao DECIMAL(5,2)    DEFAULT 0.00,
                              observacao          VARCHAR(255),
                              ativo               BOOLEAN         NOT NULL DEFAULT TRUE,
                              criado_em           TIMESTAMP       NOT NULL DEFAULT NOW(),
                              atualizado_em       TIMESTAMP
);