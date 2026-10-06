-- Atualização do banco salao_db (06/10/2026): Contas a Pagar dentro da Nota de Entrada + ajuste de tipos/limites.
-- Para bancos que já aplicaram as atualizações anteriores. NÃO apaga dados.
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-06_contas_pagar_nota.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)
-- Tudo roda numa transação (-1): se algum comando falhar (ex.: dado antigo que não cabe na nova regra), nada é alterado.

-- 1) Contas a pagar: DECIMAL(10,2) estourava com nota acima de R$ 99.999.999,99 (a nota é DECIMAL(12,2))
ALTER TABLE contas_pagar
    ALTER COLUMN valor          TYPE DECIMAL(12,2),
    ALTER COLUMN valor_desconto TYPE DECIMAL(12,2),
    ALTER COLUMN valor_multa    TYPE DECIMAL(12,2),
    ALTER COLUMN valor_juro     TYPE DECIMAL(12,2),
    ALTER COLUMN valor_pago     TYPE DECIMAL(12,2);

ALTER TABLE contas_pagar
    ADD CONSTRAINT ck_contas_pagar_valor    CHECK (valor > 0),
    ADD CONSTRAINT ck_contas_pagar_situacao CHECK (situacao IN ('ABERTA', 'PAGA', 'CANCELADA')),
    -- os quatro campos da nota de origem vêm juntos ou nenhum
    ADD CONSTRAINT ck_contas_pagar_nota CHECK (
        (nota_numero IS NULL AND nota_serie IS NULL AND nota_modelo IS NULL AND nota_fornecedor_id IS NULL)
        OR (nota_numero IS NOT NULL AND nota_serie IS NOT NULL AND nota_modelo IS NOT NULL AND nota_fornecedor_id IS NOT NULL));

-- a tela da Nota de Entrada lista as contas dela
CREATE INDEX idx_contas_pagar_nota ON contas_pagar (nota_fornecedor_id, nota_modelo, nota_serie, nota_numero);

-- 2) Fornecedores e transportadoras: CPF/CNPJ passa a ser gravado formatado (assim "12345678909" e
--    "123.456.789-09" são o mesmo documento e a duplicidade é barrada) e CEP/telefone têm o tamanho do formato.
UPDATE fornecedores SET cpf_cnpj = regexp_replace(regexp_replace(cpf_cnpj, '\D', '', 'g'),
        '^(\d{3})(\d{3})(\d{3})(\d{2})$', '\1.\2.\3-\4')
    WHERE length(regexp_replace(cpf_cnpj, '\D', '', 'g')) = 11;
UPDATE fornecedores SET cpf_cnpj = regexp_replace(regexp_replace(cpf_cnpj, '\D', '', 'g'),
        '^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$', '\1.\2.\3/\4-\5')
    WHERE length(regexp_replace(cpf_cnpj, '\D', '', 'g')) = 14;
UPDATE transportadoras SET cpf_cnpj = regexp_replace(regexp_replace(cpf_cnpj, '\D', '', 'g'),
        '^(\d{3})(\d{3})(\d{3})(\d{2})$', '\1.\2.\3-\4')
    WHERE length(regexp_replace(cpf_cnpj, '\D', '', 'g')) = 11;
UPDATE transportadoras SET cpf_cnpj = regexp_replace(regexp_replace(cpf_cnpj, '\D', '', 'g'),
        '^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$', '\1.\2.\3/\4-\5')
    WHERE length(regexp_replace(cpf_cnpj, '\D', '', 'g')) = 14;

ALTER TABLE fornecedores
    ALTER COLUMN cep TYPE VARCHAR(9),
    ALTER COLUMN fone TYPE VARCHAR(15),
    ALTER COLUMN inscricao_estadual TYPE VARCHAR(20);

ALTER TABLE transportadoras
    ALTER COLUMN cep TYPE VARCHAR(9),
    ALTER COLUMN fone TYPE VARCHAR(15),
    ADD CONSTRAINT uq_transportadoras_cpf_cnpj UNIQUE (cpf_cnpj);
