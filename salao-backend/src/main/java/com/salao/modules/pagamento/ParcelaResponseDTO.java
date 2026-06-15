package com.salao.modules.pagamento;

import java.time.LocalDateTime;

public record ParcelaResponseDTO(
        Long id,
        Integer numeroDias,
        Boolean ativo,
        LocalDateTime criadoEm,
        FormaPagamentoInfo formaPagamento,
        CondicaoPagamentoInfo condicaoPagamento
) {
    public record FormaPagamentoInfo(Long id, String formaPagamento) {}
    public record CondicaoPagamentoInfo(Long id, String condicao) {}

    public static ParcelaResponseDTO from(Parcela p) {
        FormaPagamentoInfo fp = p.getFormaPagamento() != null
                ? new FormaPagamentoInfo(p.getFormaPagamento().getId(), p.getFormaPagamento().getFormaPagamento())
                : null;
        CondicaoPagamentoInfo cp = p.getCondicaoPagamento() != null
                ? new CondicaoPagamentoInfo(p.getCondicaoPagamento().getId(), p.getCondicaoPagamento().getCondicao())
                : null;
        return new ParcelaResponseDTO(p.getId(), p.getNumeroDias(), p.getAtivo(), p.getCriadoEm(), fp, cp);
    }
}
