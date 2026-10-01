package com.salao.modules.notaentrada;

import java.math.BigDecimal;
import java.time.LocalDate;

// Linha da listagem (sem os itens)
public record NotaEntradaResumoDTO(
        Integer modelo,
        Integer serie,
        Integer numero,
        Long fornecedorId,
        String fornecedorNome,
        LocalDate dataEmissao,
        LocalDate dataChegada,
        BigDecimal valorTotal,
        String situacao,
        NotaEntradaResponseDTO.PedidoInfo pedido
) {
    public static NotaEntradaResumoDTO from(NotaEntrada n) {
        return new NotaEntradaResumoDTO(
                n.getId().getModelo(), n.getId().getSerie(), n.getId().getNumero(),
                n.getId().getFornecedorId(),
                n.getFornecedor() != null ? n.getFornecedor().getFornecedor() : null,
                n.getDataEmissao(), n.getDataChegada(), n.getValorTotal(), n.getSituacao(),
                NotaEntradaResponseDTO.pedidoDe(n));
    }
}
