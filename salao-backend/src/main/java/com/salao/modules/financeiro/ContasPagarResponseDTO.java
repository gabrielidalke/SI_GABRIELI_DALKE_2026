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
        ParcelaInfo parcela,
        FormaInfo formaPagamento,
        BigDecimal percentualDesconto,
        BigDecimal percentualMulta,
        BigDecimal percentualJuro,
        BigDecimal valorComDesconto,
        BigDecimal valorDesconto,
        BigDecimal valorMulta,
        BigDecimal valorJuro,
        BigDecimal valorPago,
        NotaInfo nota
) {
    public record FornecedorInfo(Long id, String fornecedor) {}
    public record ParcelaInfo(Long id, Integer diasVencimento) {}
    public record FormaInfo(Long id, String formaPagamento) {}
    public record NotaInfo(Integer modelo, Integer serie, Integer numero) {}

    public static ContasPagarResponseDTO from(ContasPagar c) {
        FornecedorInfo fornecedor = c.getFornecedor() != null
                ? new FornecedorInfo(c.getFornecedor().getId(), c.getFornecedor().getFornecedor())
                : null;
        ParcelaInfo parcela = c.getParcela() != null
                ? new ParcelaInfo(c.getParcela().getId(), c.getParcela().getDiasVencimento())
                : null;
        // Conta antiga sem forma gravada: usa a forma da parcela da condição
        var formaEntidade = c.getFormaPagamento() != null ? c.getFormaPagamento()
                : c.getParcela() != null ? c.getParcela().getFormaPagamento() : null;
        FormaInfo forma = formaEntidade != null
                ? new FormaInfo(formaEntidade.getId(), formaEntidade.getFormaPagamento())
                : null;
        return new ContasPagarResponseDTO(
                c.getId(), c.getDescricao(), c.getValor(),
                c.getDataVencimento(), c.getDataPagamento(),
                c.getSituacao(), c.getAtivo(), c.getCriadoEm(),
                fornecedor, parcela, forma,
                c.getPercentualDesconto(), c.getPercentualMulta(), c.getPercentualJuro(),
                c.getValor().subtract(CalculoBaixa.percentual(c.getValor(), c.getPercentualDesconto())),
                c.getValorDesconto(), c.getValorMulta(), c.getValorJuro(), c.getValorPago(),
                c.veioDeNota() ? new NotaInfo(c.getNotaModelo(), c.getNotaSerie(), c.getNotaNumero()) : null
        );
    }
}
