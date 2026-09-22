package com.salao.modules.fornecedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FornecedorRequestDTO(
        @NotBlank String fornecedor,
        String cpfCnpj,
        String endereco,
        String bairro,
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        String fone,
        String inscricaoEstadual,
        Boolean ativo,
        Long cidadeId,
        Long condicaoPagamentoId
) {}
