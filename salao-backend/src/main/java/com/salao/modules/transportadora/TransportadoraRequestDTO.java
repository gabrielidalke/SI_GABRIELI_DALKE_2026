package com.salao.modules.transportadora;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TransportadoraRequestDTO(
        @NotBlank(message = "Nome da transportadora é obrigatório") String nome,
        String cpfCnpj,
        @Pattern(regexp = "\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String fone,
        String endereco,
        String bairro,
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        Boolean ativo,
        Long cidadeId
) {}
