package com.salao.modules.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ClienteDTO(
        Long id,
        @NotBlank(message = "Nome do cliente é obrigatório") @Size(min = 3, max = 50, message = "Nome deve ter entre 3 e 50 caracteres") String nome,
        String apelido,
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Telefone é obrigatório")
        @Pattern(regexp = "\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String telefone,
        @NotBlank(message = "Endereço é obrigatório") String endereco,
        @NotBlank(message = "Número é obrigatório") String numero,
        String complemento,
        @NotBlank(message = "Bairro é obrigatório") String bairro,
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        String cpf,
        String rg,
        @PastOrPresent(message = "Data de nascimento não pode ser futura")
        LocalDate dataNascimento,
        String sexo,
        String estadoCivil,
        String observacao,
        Boolean ativo,
        @NotNull(message = "Cidade é obrigatória") Long cidadeId
) {}