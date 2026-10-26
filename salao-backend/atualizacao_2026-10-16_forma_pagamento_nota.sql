-- Atualização do banco salao_db (16/10/2026): Forma de Pagamento na Nota de Entrada.
-- Para bancos que já aplicaram as atualizações anteriores (inclusive a de cancelamento/custo médio). NÃO apaga dados.
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-16_forma_pagamento_nota.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)
-- IMPORTANTE: rode ANTES de subir o backend novo (o Hibernate valida as colunas na inicialização).

-- Forma escolhida na nota (vem sugerida da condição de pagamento, mas pode ser trocada)
ALTER TABLE notas_entrada
    ADD COLUMN forma_pagamento_id BIGINT REFERENCES formas_pagamento(id);

-- Cada conta a pagar guarda a forma com que será paga
ALTER TABLE contas_pagar
    ADD COLUMN forma_pagamento_id BIGINT REFERENCES formas_pagamento(id);

-- Contas já existentes: assumem a forma da parcela da condição que as gerou
UPDATE contas_pagar c SET forma_pagamento_id = p.forma_pagamento_id
    FROM parcelas p WHERE p.id = c.parcela_id AND c.forma_pagamento_id IS NULL;
