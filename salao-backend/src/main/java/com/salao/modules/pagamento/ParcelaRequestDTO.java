package com.salao.modules.pagamento;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ParcelaRequestDTO(
        Integer numeroParcela,
        @NotNull(message = "Dias para vencimento da parcela é obrigatório") @PositiveOrZero(message = "Dias de vencimento não pode ser negativo") Integer diasVencimento,
        @DecimalMin(value = "0", message = "Percentual deve estar entre 0 e 100")
        @DecimalMax(value = "100", message = "Percentual deve estar entre 0 e 100")
        BigDecimal percentual,
        @NotNull(message = "Forma de pagamento da parcela é obrigatória") Long formaPagamentoId,
        Long condicaoPagamentoId,
        Boolean ativo
) {}
