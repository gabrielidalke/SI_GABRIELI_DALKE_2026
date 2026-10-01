package com.salao.modules.pagamento;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record FormaPagamentoRequestDTO(
        @NotBlank(message = "Forma de pagamento é obrigatória") String formaPagamento,
        @DecimalMin(value = "0", message = "Percentual deve estar entre 0 e 100")
        @DecimalMax(value = "100", message = "Percentual deve estar entre 0 e 100")
        BigDecimal percentual,
        @PositiveOrZero(message = "Número de dias não pode ser negativo")
        Integer numeroDias,
        Boolean ativo
) {}
