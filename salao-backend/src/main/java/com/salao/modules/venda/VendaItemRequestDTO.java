package com.salao.modules.venda;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record VendaItemRequestDTO(
        @NotNull(message = "Produto do item é obrigatório") Long produtoId,
        @NotNull(message = "Quantidade é obrigatória") @Positive(message = "Quantidade deve ser maior que zero") BigDecimal quantidade,
        @NotNull(message = "Preço unitário é obrigatório") @PositiveOrZero(message = "Preço unitário não pode ser negativo") BigDecimal precoUnitario
) {}
