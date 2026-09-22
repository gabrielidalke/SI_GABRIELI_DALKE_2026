package com.salao.modules.funcionario;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FuncionarioDTO(
        Long id,
        @NotBlank String nome,
        String apelido,
        @NotBlank String email,
        @NotBlank String telefone,
        String cpf,
        LocalDate dataNascimento,
        @NotNull LocalDate dataAdmissao,
        LocalDate dataDemissao,
        String sexo,
        String estadoCivil,
        String endereco,
        String numero,
        String complemento,
        String bairro,
        @NotBlank(message = "CEP é obrigatório")
        @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
        String cep,
        BigDecimal salario,
        BigDecimal percentualComissao,
        String observacao,
        Boolean ativo
) {}