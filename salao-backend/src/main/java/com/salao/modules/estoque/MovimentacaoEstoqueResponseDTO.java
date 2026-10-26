package com.salao.modules.estoque;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoEstoqueResponseDTO(
        Long id,
        ProdutoInfo produto,
        String tipo,
        BigDecimal quantidade,
        Integer saldoAnterior,
        Integer saldoResultante,
        BigDecimal custoUnitario,
        BigDecimal custoMedioAnterior,
        BigDecimal custoMedioPosterior,
        String origemTipo,
        Long origemId,
        String documento,
        LocalDateTime criadoEm
) {
    public record ProdutoInfo(Long id, String nome) {}

    public static MovimentacaoEstoqueResponseDTO from(MovimentacaoEstoque m) {
        ProdutoInfo produto = m.getProduto() != null
                ? new ProdutoInfo(m.getProduto().getId(), m.getProduto().getNome())
                : null;
        return new MovimentacaoEstoqueResponseDTO(
                m.getId(), produto, m.getTipo(), m.getQuantidade(),
                m.getSaldoAnterior(), m.getSaldoResultante(), m.getCustoUnitario(),
                m.getCustoMedioAnterior(), m.getCustoMedioPosterior(),
                m.getOrigemTipo(), m.getOrigemId(), m.getDocumento(), m.getCriadoEm()
        );
    }
}
