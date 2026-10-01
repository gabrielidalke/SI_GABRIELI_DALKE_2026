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
        CondicaoPagamentoInfo condicaoPagamento,
        List<VendaItemResponseDTO> itens
) {
    public record ClienteInfo(Long id, String nome) {}
    public record CondicaoPagamentoInfo(Long id, String condicao) {}

    public static VendaResponseDTO from(Venda v) {
        ClienteInfo cliente = v.getCliente() != null
                ? new ClienteInfo(v.getCliente().getId(), v.getCliente().getNome())
                : null;
        CondicaoPagamentoInfo condicaoPagamento = v.getCondicaoPagamento() != null
                ? new CondicaoPagamentoInfo(v.getCondicaoPagamento().getId(), v.getCondicaoPagamento().getCondicao())
                : null;
        List<VendaItemResponseDTO> itens = v.getItens().stream()
                .map(VendaItemResponseDTO::from).toList();
        return new VendaResponseDTO(
                v.getId(), v.getNumeroVenda(), v.getDataVenda(), v.getValorTotal(),
                v.getObservacao(), v.getStatus(), v.getCriadoEm(), cliente, condicaoPagamento, itens
        );
    }
}
