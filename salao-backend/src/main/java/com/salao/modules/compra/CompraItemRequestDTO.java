package com.salao.modules.compra;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CompraItemRequestDTO(
        @NotNull Long produtoId,
        @NotNull BigDecimal quantidade,
        @NotNull BigDecimal precoUnitario
) {}
