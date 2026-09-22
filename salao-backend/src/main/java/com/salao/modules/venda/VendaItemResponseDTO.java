package com.salao.modules.venda;

import java.math.BigDecimal;

public record VendaItemResponseDTO(
        Long id,
        BigDecimal quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        ProdutoInfo produto
) {
    public record ProdutoInfo(Long id, String nome, BigDecimal precoVenda) {}

    public static VendaItemResponseDTO from(VendaItem item) {
        ProdutoInfo produto = item.getProduto() != null
                ? new ProdutoInfo(item.getProduto().getId(), item.getProduto().getNome(), item.getProduto().getPrecoVenda())
                : null;
        return new VendaItemResponseDTO(
                item.getId(), item.getQuantidade(), item.getPrecoUnitario(), item.getSubtotal(), produto
        );
    }
}
