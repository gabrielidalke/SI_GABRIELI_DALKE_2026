ALTER TABLE vendas
    ADD COLUMN condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id);
