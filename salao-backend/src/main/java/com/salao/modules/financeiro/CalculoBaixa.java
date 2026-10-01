package com.salao.modules.financeiro;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Valor final da baixa de uma conta (pagamento ou recebimento).
 * Até o vencimento: ganha o desconto da condição (no "À Vista" o vencimento é o próprio dia).
 * Depois do vencimento: perde o desconto e paga multa (uma vez) + juro ao mês proporcional aos dias de atraso.
 */
public record CalculoBaixa(
        LocalDate dataBaixa,
        LocalDate dataVencimento,
        long diasAtraso,
        BigDecimal valor,
        BigDecimal percentualDesconto,
        BigDecimal valorDesconto,
        BigDecimal percentualMulta,
        BigDecimal valorMulta,
        BigDecimal percentualJuro,
        BigDecimal valorJuro,
        BigDecimal valorFinal
) {
    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final BigDecimal DIAS_MES = BigDecimal.valueOf(30);

    public static CalculoBaixa calcular(BigDecimal valor, LocalDate dataVencimento, LocalDate dataBaixa,
                                        BigDecimal percentualDesconto, BigDecimal percentualMulta,
                                        BigDecimal percentualJuro) {
        long diasAtraso = Math.max(0, ChronoUnit.DAYS.between(dataVencimento, dataBaixa));
        BigDecimal desconto = BigDecimal.ZERO;
        BigDecimal multa = BigDecimal.ZERO;
        BigDecimal juro = BigDecimal.ZERO;

        if (diasAtraso == 0) {
            desconto = percentual(valor, percentualDesconto);
        } else {
            multa = percentual(valor, percentualMulta);
            juro = valor.multiply(nvl(percentualJuro))
                    .multiply(BigDecimal.valueOf(diasAtraso))
                    .divide(CEM.multiply(DIAS_MES), 2, RoundingMode.HALF_UP);
        }

        return new CalculoBaixa(dataBaixa, dataVencimento, diasAtraso, valor,
                nvl(percentualDesconto), desconto,
                nvl(percentualMulta), multa,
                nvl(percentualJuro), juro,
                valor.subtract(desconto).add(multa).add(juro));
    }

    public static BigDecimal percentual(BigDecimal valor, BigDecimal percentual) {
        return valor.multiply(nvl(percentual)).divide(CEM, 2, RoundingMode.HALF_UP);
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
