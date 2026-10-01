package com.salao.modules.financeiro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContasPagarRequestDTO(
        @NotBlank(message = "Descrição é obrigatória") String descricao,
        @NotNull(message = "Valor é obrigatório") @Positive(message = "Valor deve ser maior que zero") BigDecimal valor,
        @NotNull(message = "Data de vencimento é obrigatória") LocalDate dataVencimento,
        @NotNull(message = "Fornecedor é obrigatório") Long fornecedorId,
        Long parcelaId
) {}
