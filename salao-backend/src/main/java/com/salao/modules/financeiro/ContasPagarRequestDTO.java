package com.salao.modules.financeiro;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContasPagarRequestDTO(
        @NotBlank(message = "Descrição é obrigatória")
        @Size(max = 200, message = "Descrição deve ter no máximo 200 caracteres") String descricao,
        @NotNull(message = "Valor é obrigatório")
        @Positive(message = "Valor deve ser maior que zero")
        @Digits(integer = 10, fraction = 2, message = "Valor inválido (máximo 10 inteiros e 2 decimais)") BigDecimal valor,
        @NotNull(message = "Data de vencimento é obrigatória") LocalDate dataVencimento,
        @NotNull(message = "Fornecedor é obrigatório") Long fornecedorId,
        Long parcelaId
) {}
