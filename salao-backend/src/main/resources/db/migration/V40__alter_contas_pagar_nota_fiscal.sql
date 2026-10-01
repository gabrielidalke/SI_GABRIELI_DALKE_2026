ALTER TABLE contas_pagar
    ADD COLUMN nota_fiscal_entrada_id BIGINT REFERENCES notas_fiscais_entrada(id);
