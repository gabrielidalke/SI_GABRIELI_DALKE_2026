package com.salao.modules.pagamento;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record FormaPagamentoRequestDTO(
        @NotBlank String formaPagamento,
        BigDecimal percentual,
        Integer numeroDias,
        Boolean ativo
) {}
