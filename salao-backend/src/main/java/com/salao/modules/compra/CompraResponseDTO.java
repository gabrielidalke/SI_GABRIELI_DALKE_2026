package com.salao.modules.compra;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CompraResponseDTO(
        Long id,
        String numeroCompra,
        LocalDate dataCompra,
        BigDecimal valorTotal,
        String observacao,
        String status,
        LocalDateTime criadoEm,
        FornecedorInfo fornecedor,
        List<CompraItemResponseDTO> itens
) {
    public record FornecedorInfo(Long id, String fornecedor) {}

    public static CompraResponseDTO from(Compra c) {
        FornecedorInfo fornecedor = c.getFornecedor() != null
                ? new FornecedorInfo(c.getFornecedor().getId(), c.getFornecedor().getFornecedor())
                : null;
        List<CompraItemResponseDTO> itens = c.getItens().stream()
                .map(CompraItemResponseDTO::from).toList();
        return new CompraResponseDTO(
                c.getId(), c.getNumeroCompra(), c.getDataCompra(), c.getValorTotal(),
                c.getObservacao(), c.getStatus(), c.getCriadoEm(), fornecedor, itens
        );
    }
}
