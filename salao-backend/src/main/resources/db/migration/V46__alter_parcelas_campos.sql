ALTER TABLE parcelas RENAME COLUMN numero_dias TO dias_vencimento;
ALTER TABLE parcelas ADD COLUMN numero_parcela INTEGER;
