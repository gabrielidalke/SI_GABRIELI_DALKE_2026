package com.salao.modules.fornecedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequestDTO(
        @NotBlank(message = "Nome do fornecedor é obrigatório")
        @Size(min = 3, max = 150, message = "Nome do fornecedor deve ter entre 3 e 150 caracteres") String fornecedor,
        @Size(max = 18, message = "CPF/CNPJ deve ter no máximo 18 caracteres")
        @Pattern(regexp = "[0-9./-]*", message = "CPF/CNPJ deve conter apenas números, pontos, traço e barra") String cpfCnpj,
        @Size(max = 200, message = "Endereço deve ter no máximo 200 caracteres") String endereco,
        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres") String bairro,
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        @Size(max = 15, message = "Telefone deve ter no máximo 15 caracteres")
        @Pattern(regexp = "\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String fone,
        @Size(max = 20, message = "Inscrição estadual deve ter no máximo 20 caracteres")
        @Pattern(regexp = "[A-Za-z0-9./-]*", message = "Inscrição estadual inválida (use só letras, números, ponto, traço e barra)") String inscricaoEstadual,
        Boolean ativo,
        Long cidadeId,
        Long condicaoPagamentoId
) {}
