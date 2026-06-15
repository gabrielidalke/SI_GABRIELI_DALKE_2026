package com.salao.modules.financeiro;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContasReceberRequestDTO(
        String descricao,
        @NotNull BigDecimal valor,
        @NotNull LocalDate dataVencimento,
        @NotNull Long clienteId,
        Long parcelaId
) {}
