package com.salao.modules.notaentrada;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

// Só o que o usuário informa; desconto em valor, rateios e custo final são calculados no backend
public record NotaEntradaItemRequestDTO(
        @NotNull(message = "Produto do item é obrigatório") Long produtoId,
        @NotNull(message = "Classificação da conta do item é obrigatória") Long classificacaoContaId,
        @NotNull(message = "Quantidade é obrigatória")
        @Positive(message = "Quantidade deve ser maior que zero")
        @Digits(integer = 7, fraction = 3, message = "Quantidade inválida (máximo 7 inteiros e 3 decimais)") BigDecimal quantidade,
        @NotNull(message = "Valor unitário é obrigatório")
        @PositiveOrZero(message = "Valor unitário não pode ser negativo")
        @Digits(integer = 9, fraction = 2, message = "Valor unitário inválido (máximo 2 decimais)") BigDecimal valorUnitario,
        @DecimalMin(value = "0", message = "Desconto deve estar entre 0 e 100%")
        @DecimalMax(value = "100", message = "Desconto deve estar entre 0 e 100%") BigDecimal descontoPercentual
) {}
