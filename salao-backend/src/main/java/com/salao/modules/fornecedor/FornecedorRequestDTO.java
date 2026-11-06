package com.salao.modules.fornecedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record FornecedorRequestDTO(
        String tipoPessoa, // FISICA ou JURIDICA (vazio = JURIDICA)
        @NotBlank(message = "Nome do fornecedor é obrigatório")
        @Size(min = 3, max = 150, message = "Nome do fornecedor deve ter entre 3 e 150 caracteres") String fornecedor,
        @Size(max = 150, message = "Nome fantasia deve ter no máximo 150 caracteres") String nomeFantasia,
        @Size(max = 18, message = "CPF/CNPJ deve ter no máximo 18 caracteres")
        @Pattern(regexp = "[0-9./-]*", message = "CPF/CNPJ deve conter apenas números, pontos, traço e barra") String cpfCnpj,
        @Size(max = 20, message = "RG deve ter no máximo 20 caracteres") String rg,
        @Size(max = 20, message = "Inscrição estadual deve ter no máximo 20 caracteres")
        @Pattern(regexp = "[A-Za-z0-9./-]*", message = "Inscrição estadual inválida (use só letras, números, ponto, traço e barra)") String inscricaoEstadual,
        @Size(max = 20, message = "Inscrição estadual do substituto tributário deve ter no máximo 20 caracteres")
        @Pattern(regexp = "[A-Za-z0-9./-]*", message = "Inscrição estadual do substituto tributário inválida") String inscEstSubstTrib,
        @Size(max = 20, message = "Inscrição municipal deve ter no máximo 20 caracteres") String inscricaoMunicipal,
        @Size(max = 200, message = "Endereço deve ter no máximo 200 caracteres") String endereco,
        @Size(max = 10, message = "Número deve ter no máximo 10 caracteres") String numero,
        @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres") String complemento,
        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres") String bairro,
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        @Size(max = 15, message = "Telefone deve ter no máximo 15 caracteres")
        @Pattern(regexp = "|\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String fone,
        @Size(max = 15, message = "Celular deve ter no máximo 15 caracteres")
        @Pattern(regexp = "|\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Celular inválido")
        String celular,
        @Size(max = 150, message = "E-mail deve ter no máximo 150 caracteres")
        @Email(message = "E-mail inválido") String email,
        @Size(max = 100, message = "Contato deve ter no máximo 100 caracteres") String contato,
        @Size(max = 150, message = "Site deve ter no máximo 150 caracteres") String site,
        @Size(max = 500, message = "Observação deve ter no máximo 500 caracteres") String observacao,
        Boolean ativo,
        Long cidadeId,
        Long condicaoPagamentoId
) {}
