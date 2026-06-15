package com.salao.modules.fornecedor;

import jakarta.validation.constraints.NotBlank;

public record FornecedorRequestDTO(
        @NotBlank String fornecedor,
        String cpfCnpj,
        String endereco,
        String bairro,
        String cep,
        String fone,
        String inscricaoEstadual,
        Boolean ativo,
        Long cidadeId
) {}
