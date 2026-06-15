package com.salao.modules.fiscal.entrada;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NotaFiscalEntradaResponseDTO(
        Long id,
        String numeroNota,
        String serie,
        LocalDateTime dataEmissao,
        String chaveAcesso,
        BigDecimal valorTotal,
        String transportadoraNome,
        String veiculoPlaca,
        String observacao,
        CompraInfo compra,
        FornecedorInfo fornecedor
) {
    public record CompraInfo(Long id, String numeroCompra) {}
    public record FornecedorInfo(Long id, String fornecedor) {}

    public static NotaFiscalEntradaResponseDTO from(NotaFiscalEntrada n) {
        CompraInfo compra = n.getCompra() != null
                ? new CompraInfo(n.getCompra().getId(), n.getCompra().getNumeroCompra())
                : null;
        FornecedorInfo fornecedor = n.getFornecedor() != null
                ? new FornecedorInfo(n.getFornecedor().getId(), n.getFornecedor().getFornecedor())
                : null;
        return new NotaFiscalEntradaResponseDTO(
                n.getId(), n.getNumeroNota(), n.getSerie(), n.getDataEmissao(),
                n.getChaveAcesso(), n.getValorTotal(), n.getTransportadoraNome(),
                n.getVeiculoPlaca(), n.getObservacao(), compra, fornecedor
        );
    }
}
