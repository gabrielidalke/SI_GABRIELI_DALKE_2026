ALTER TABLE contas_receber
    ADD COLUMN nota_fiscal_saida_id BIGINT REFERENCES notas_fiscais_saida(id);
