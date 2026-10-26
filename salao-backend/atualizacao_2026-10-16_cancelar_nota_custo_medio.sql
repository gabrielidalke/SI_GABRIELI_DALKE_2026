-- Atualização do banco salao_db (16/10/2026): cancelamento da Nota de Entrada + custo médio no estoque.
-- Para bancos que já aplicaram as atualizações anteriores. NÃO apaga dados.
-- Execute dentro do salao_db:   psql -U postgres -d salao_db -1 -v ON_ERROR_STOP=1 -f atualizacao_2026-10-16_cancelar_nota_custo_medio.sql
-- (num banco novo use só o schema.sql, que já inclui tudo isto)
-- IMPORTANTE: rode ANTES de subir o backend novo (o Hibernate valida as colunas na inicialização).

-- 1) Custo médio ponderado do produto (atualizado a cada entrada confirmada)
ALTER TABLE produtos
    ADD COLUMN custo_medio DECIMAL(12,4) NOT NULL DEFAULT 0 CHECK (custo_medio >= 0);

-- Produtos que já tiveram entrada: parte do custo da última entrada (é o melhor valor conhecido hoje)
UPDATE produtos p SET custo_medio = COALESCE((
    SELECT m.custo_unitario FROM movimentacoes_estoque m
    WHERE m.produto_id = p.id AND m.tipo = 'ENTRADA' AND m.custo_unitario > 0
    ORDER BY m.criado_em DESC, m.id DESC LIMIT 1), 0);

-- 2) Cada movimentação guarda o custo médio antes e depois
ALTER TABLE movimentacoes_estoque
    ADD COLUMN custo_medio_anterior  DECIMAL(12,4),
    ADD COLUMN custo_medio_posterior DECIMAL(12,4);

-- 3) Nota de Entrada passa a poder ser CANCELADA, sempre com motivo
ALTER TABLE notas_entrada
    ADD COLUMN motivo_cancelamento VARCHAR(300),
    ADD COLUMN cancelado_em        TIMESTAMP;

ALTER TABLE notas_entrada DROP CONSTRAINT IF EXISTS notas_entrada_situacao_check;
ALTER TABLE notas_entrada
    ADD CONSTRAINT notas_entrada_situacao_check CHECK (situacao IN ('PENDENTE', 'CONFERIDA', 'CANCELADA')),
    ADD CONSTRAINT ck_nota_entrada_cancelamento CHECK (
        (situacao = 'CANCELADA' AND motivo_cancelamento IS NOT NULL AND length(trim(motivo_cancelamento)) > 0)
        OR (situacao <> 'CANCELADA' AND motivo_cancelamento IS NULL));
