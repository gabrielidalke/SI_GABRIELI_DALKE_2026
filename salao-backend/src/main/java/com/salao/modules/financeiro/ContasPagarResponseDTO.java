package com.salao.modules.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContasPagarResponseDTO(
        Long id,
        String descricao,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataPagamento,
        String situacao,
        Boolean ativo,
        LocalDateTime criadoEm,
        FornecedorInfo fornecedor,
        ParcelaInfo parcela
) {
    public record FornecedorInfo(Long id, String fornecedor) {}
    public record ParcelaInfo(Long id, Integer numeroDias) {}

    public static ContasPagarResponseDTO from(ContasPagar c) {
        FornecedorInfo fornecedor = c.getFornecedor() != null
                ? new FornecedorInfo(c.getFornecedor().getId(), c.getFornecedor().getFornecedor())
                : null;
        ParcelaInfo parcela = c.getParcela() != null
                ? new ParcelaInfo(c.getParcela().getId(), c.getParcela().getNumeroDias())
                : null;
        return new ContasPagarResponseDTO(
                c.getId(), c.getDescricao(), c.getValor(),
                c.getDataVencimento(), c.getDataPagamento(),
                c.getSituacao(), c.getAtivo(), c.getCriadoEm(),
                fornecedor, parcela
        );
    }
}
