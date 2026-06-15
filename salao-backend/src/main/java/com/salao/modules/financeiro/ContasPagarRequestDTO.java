package com.salao.modules.financeiro;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContasPagarRequestDTO(
        String descricao,
        @NotNull BigDecimal valor,
        @NotNull LocalDate dataVencimento,
        @NotNull Long fornecedorId,
        Long parcelaId
) {}
