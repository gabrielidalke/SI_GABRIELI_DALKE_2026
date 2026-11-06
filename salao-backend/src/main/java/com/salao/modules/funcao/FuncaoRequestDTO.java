package com.salao.modules.funcao;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FuncaoRequestDTO(
        @NotBlank(message = "Nome da função é obrigatório")
        @Size(min = 2, max = 60, message = "Função deve ter entre 2 e 60 caracteres") String funcao,
        @NotNull(message = "Salário base é obrigatório")
        @PositiveOrZero(message = "Salário base não pode ser negativo")
        @Digits(integer = 8, fraction = 2, message = "Salário base inválido (máximo 2 decimais)") BigDecimal salarioBase,
        Boolean ativo
) {}
