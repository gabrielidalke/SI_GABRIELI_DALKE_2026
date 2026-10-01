-- Alinha paises/estados/cidades com o naming padrão (criado_em/atualizado_em) usado
-- em todas as outras tabelas, e completa colunas que faltavam em paises.

ALTER TABLE paises RENAME COLUMN pais TO nome;
ALTER TABLE paises RENAME COLUMN data_criacao TO criado_em;
ALTER TABLE paises RENAME COLUMN data_atualizacao TO atualizado_em;
ALTER TABLE paises ADD COLUMN nacionalidade VARCHAR(100);

ALTER TABLE estados RENAME COLUMN data_criacao TO criado_em;
ALTER TABLE estados RENAME COLUMN data_atualizacao TO atualizado_em;

ALTER TABLE cidades RENAME COLUMN data_criacao TO criado_em;
ALTER TABLE cidades RENAME COLUMN data_atualizacao TO atualizado_em;
