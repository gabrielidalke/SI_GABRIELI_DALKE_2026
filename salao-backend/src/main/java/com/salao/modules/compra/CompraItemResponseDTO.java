package com.salao.modules.compra;

import java.math.BigDecimal;

public record CompraItemResponseDTO(
        Long id,
        BigDecimal quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal,
        ProdutoInfo produto
) {
    public record ProdutoInfo(Long id, String nome, BigDecimal preco) {}

    public static CompraItemResponseDTO from(CompraItem item) {
        ProdutoInfo produto = item.getProduto() != null
                ? new ProdutoInfo(item.getProduto().getId(), item.getProduto().getNome(), item.getProduto().getPreco())
                : null;
        return new CompraItemResponseDTO(
                item.getId(), item.getQuantidade(), item.getPrecoUnitario(), item.getSubtotal(), produto
        );
    }
}
