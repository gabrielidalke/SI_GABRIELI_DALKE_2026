package com.salao.modules.transportadora;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TransportadoraRequestDTO(
        @NotBlank(message = "Nome da transportadora é obrigatório")
        @Size(min = 3, max = 150, message = "Nome da transportadora deve ter entre 3 e 150 caracteres") String nome,
        @Size(max = 18, message = "CPF/CNPJ deve ter no máximo 18 caracteres")
        @Pattern(regexp = "[0-9./-]*", message = "CPF/CNPJ deve conter apenas números, pontos, traço e barra") String cpfCnpj,
        @Size(max = 15, message = "Telefone deve ter no máximo 15 caracteres")
        @Pattern(regexp = "\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String fone,
        @Size(max = 200, message = "Endereço deve ter no máximo 200 caracteres") String endereco,
        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres") String bairro,
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        Boolean ativo,
        Long cidadeId
) {}
