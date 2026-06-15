package com.salao.modules.pagamento;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record CondicaoPagamentoRequestDTO(
        @NotBlank String condicao,
        BigDecimal multa,
        BigDecimal desconto,
        Boolean ativo
) {}
