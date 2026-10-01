ALTER TABLE fornecedores
    ADD COLUMN cpf_cnpj            VARCHAR(18),
    ADD COLUMN endereco            VARCHAR(200),
    ADD COLUMN bairro              VARCHAR(100),
    ADD COLUMN cep                 VARCHAR(20),
    ADD COLUMN fone                VARCHAR(20),
    ADD COLUMN inscricao_estadual  VARCHAR(30),
    ADD COLUMN cidade_id           BIGINT REFERENCES cidades(id),
    ADD COLUMN condicao_pagamento_id BIGINT REFERENCES condicoes_pagamento(id);
