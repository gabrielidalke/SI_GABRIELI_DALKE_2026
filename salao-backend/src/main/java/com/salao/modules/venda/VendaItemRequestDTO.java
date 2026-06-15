package com.salao.modules.venda;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record VendaItemRequestDTO(
        @NotNull Long produtoId,
        @NotNull BigDecimal quantidade,
        @NotNull BigDecimal precoUnitario
) {}
