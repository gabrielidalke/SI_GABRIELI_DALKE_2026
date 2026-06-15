package com.salao.modules.venda;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record VendaResponseDTO(
        Long id,
        String numeroVenda,
        LocalDate dataVenda,
        BigDecimal valorTotal,
        String observacao,
        String status,
        LocalDateTime criadoEm,
        ClienteInfo cliente,
        List<VendaItemResponseDTO> itens
) {
    public record ClienteInfo(Long id, String nome) {}

    public static VendaResponseDTO from(Venda v) {
        ClienteInfo cliente = v.getCliente() != null
                ? new ClienteInfo(v.getCliente().getId(), v.getCliente().getNome())
                : null;
        List<VendaItemResponseDTO> itens = v.getItens().stream()
                .map(VendaItemResponseDTO::from).toList();
        return new VendaResponseDTO(
                v.getId(), v.getNumeroVenda(), v.getDataVenda(), v.getValorTotal(),
                v.getObservacao(), v.getStatus(), v.getCriadoEm(), cliente, itens
        );
    }
}
