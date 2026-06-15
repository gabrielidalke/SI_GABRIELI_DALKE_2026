package com.salao.modules.pagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FormaPagamentoResponseDTO(
        Long id,
        String formaPagamento,
        BigDecimal percentual,
        Integer numeroDias,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static FormaPagamentoResponseDTO from(FormaPagamento f) {
        return new FormaPagamentoResponseDTO(
                f.getId(), f.getFormaPagamento(), f.getPercentual(),
                f.getNumeroDias(), f.getAtivo(), f.getCriadoEm()
        );
    }
}
