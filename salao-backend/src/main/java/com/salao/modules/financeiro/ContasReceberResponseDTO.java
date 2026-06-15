package com.salao.modules.financeiro;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContasReceberResponseDTO(
        Long id,
        String descricao,
        BigDecimal valor,
        LocalDate dataVencimento,
        LocalDate dataRecebimento,
        String situacao,
        Boolean ativo,
        LocalDateTime criadoEm,
        ClienteInfo cliente,
        ParcelaInfo parcela
) {
    public record ClienteInfo(Long id, String nome) {}
    public record ParcelaInfo(Long id, Integer numeroDias) {}

    public static ContasReceberResponseDTO from(ContasReceber c) {
        ClienteInfo cliente = c.getCliente() != null
                ? new ClienteInfo(c.getCliente().getId(), c.getCliente().getNome())
                : null;
        ParcelaInfo parcela = c.getParcela() != null
                ? new ParcelaInfo(c.getParcela().getId(), c.getParcela().getNumeroDias())
                : null;
        return new ContasReceberResponseDTO(
                c.getId(), c.getDescricao(), c.getValor(),
                c.getDataVencimento(), c.getDataRecebimento(),
                c.getSituacao(), c.getAtivo(), c.getCriadoEm(),
                cliente, parcela
        );
    }
}
