package com.salao.modules.funcionario;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
        String cep,
        BigDecimal salario,
        BigDecimal percentualComissao,
        String observacao,
        Boolean ativo
) {}