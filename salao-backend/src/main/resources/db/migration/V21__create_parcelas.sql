CREATE TABLE parcelas (
    id                    BIGSERIAL PRIMARY KEY,
    numero_dias           INTEGER   NOT NULL,
    ativo                 BOOLEAN   NOT NULL DEFAULT TRUE,
    criado_em             TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em         TIMESTAMP,
    forma_pagamento_id    BIGINT    REFERENCES formas_pagamento(id),
    condicao_pagamento_id BIGINT    REFERENCES condicoes_pagamento(id)
);
