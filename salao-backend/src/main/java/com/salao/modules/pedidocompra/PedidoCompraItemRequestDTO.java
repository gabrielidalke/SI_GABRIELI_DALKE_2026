package com.salao.modules.pedidocompra;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record PedidoCompraItemRequestDTO(
        @NotNull(message = "Produto do item é obrigatório") Long produtoId,
        @NotNull(message = "Quantidade é obrigatória")
        @Positive(message = "Quantidade deve ser maior que zero") BigDecimal quantidade,
        @NotNull(message = "Valor unitário é obrigatório")
        @PositiveOrZero(message = "Valor unitário não pode ser negativo") BigDecimal valorUnitario
) {}
