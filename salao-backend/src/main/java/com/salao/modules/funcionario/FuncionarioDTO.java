package com.salao.modules.funcionario;


import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FuncionarioDTO(
        Long id,
        @NotBlank(message = "Nome do funcionário é obrigatório") String nome,
        String apelido,
        @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "Telefone é obrigatório")
        @Pattern(regexp = "\\(?\\d{2}\\)?[\\s-]?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
        String telefone,
        String cpf,
        @PastOrPresent(message = "Data de nascimento não pode ser futura")
        LocalDate dataNascimento,
        @NotNull(message = "Data de admissão é obrigatória")
        @PastOrPresent(message = "Data de admissão não pode ser futura")
        LocalDate dataAdmissao,
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
        @PositiveOrZero(message = "Salário não pode ser negativo")
        BigDecimal salario,
        @DecimalMin(value = "0", message = "Comissão deve estar entre 0 e 100%")
        @DecimalMax(value = "100", message = "Comissão deve estar entre 0 e 100%")
        BigDecimal percentualComissao,
        String observacao,
        Boolean ativo
) {}