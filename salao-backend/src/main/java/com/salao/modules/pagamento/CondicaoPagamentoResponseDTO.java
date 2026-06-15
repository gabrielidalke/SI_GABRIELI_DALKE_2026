package com.salao.modules.pagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CondicaoPagamentoResponseDTO(
        Long id,
        String condicao,
        BigDecimal multa,
        BigDecimal desconto,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static CondicaoPagamentoResponseDTO from(CondicaoPagamento c) {
        return new CondicaoPagamentoResponseDTO(
                c.getId(), c.getCondicao(), c.getMulta(),
                c.getDesconto(), c.getAtivo(), c.getCriadoEm()
        );
    }
}
