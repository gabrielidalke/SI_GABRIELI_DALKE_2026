package com.salao.modules.pagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CondicaoPagamentoResponseDTO(
        Long id,
        String condicao,
        BigDecimal multa,
        BigDecimal juro,
        BigDecimal desconto,
        Boolean ativo,
        LocalDateTime criadoEm,
        List<ParcelaResponseDTO> parcelas
) {
    public static CondicaoPagamentoResponseDTO from(CondicaoPagamento c) {
        return new CondicaoPagamentoResponseDTO(
                c.getId(), c.getCondicao(), c.getMulta(), c.getJuro(),
                c.getDesconto(), c.getAtivo(), c.getCriadoEm(),
                c.getParcelas().stream().map(ParcelaResponseDTO::from).toList()
        );
    }
}
