package com.salao.modules.pedidocompra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoCompraResponseDTO(
        Integer modelo,
        Integer serie,
        Integer numero,
        FornecedorInfo fornecedor,
        LocalDate dataPedido,
        String observacoes,
        String situacao,
        BigDecimal valorTotal,
        List<ItemInfo> itens,
        LocalDateTime criadoEm
) {
    public record FornecedorInfo(Long id, String nome, Boolean ativo) {}

    public record ItemInfo(Long produtoId, String produtoNome, String unidade,
                           BigDecimal quantidade, BigDecimal valorUnitario, BigDecimal quantidadeRecebida) {}

    public static PedidoCompraResponseDTO from(PedidoCompra p, List<PedidoCompraItem> itens) {
        var fornecedor = p.getFornecedor() != null
                ? new FornecedorInfo(p.getFornecedor().getId(), p.getFornecedor().getFornecedor(), p.getFornecedor().getAtivo())
                : new FornecedorInfo(p.getId().getFornecedorId(), null, null);
        var itensDto = itens.stream().map(i -> new ItemInfo(
                i.getId().getProdutoId(),
                i.getProduto() != null ? i.getProduto().getNome() : null,
                i.getProduto() != null && i.getProduto().getUnidadeMedida() != null
                        ? i.getProduto().getUnidadeMedida().getSigla() : null,
                i.getQuantidade(), i.getValorUnitario(), i.getQuantidadeRecebida())).toList();
        BigDecimal total = itens.stream()
                .map(i -> i.getQuantidade().multiply(i.getValorUnitario()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PedidoCompraResponseDTO(
                p.getId().getModelo(), p.getId().getSerie(), p.getId().getNumero(),
                fornecedor, p.getDataPedido(), p.getObservacoes(), p.getSituacao(),
                total, itensDto, p.getCriadoEm());
    }
}
