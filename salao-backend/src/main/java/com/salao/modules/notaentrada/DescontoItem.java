package com.salao.modules.notaentrada;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Regra do desconto de item (Nota de Entrada e Pedido de Compra): o desconto sai do VALOR UNITÁRIO,
 * não do total do item.
 *   desconto unitário = valor unitário x percentual (ou o valor em R$ por unidade informado)
 *   valor unitário líquido = valor unitário - desconto unitário
 *   total do item = quantidade x valor unitário líquido  (desconto do item = quantidade x desconto unitário)
 */
public record DescontoItem(BigDecimal percentual, BigDecimal unitario, BigDecimal total) {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    // Quando o desconto em R$ por unidade é informado ele manda (e o percentual é só informativo);
    // senão vale o percentual
    public static DescontoItem calcular(String produto, BigDecimal quantidade, BigDecimal valorUnitario,
                                        BigDecimal percentual, BigDecimal descontoUnitario) {
        BigDecimal unitario;
        BigDecimal pct;
        if (descontoUnitario != null) {
            unitario = descontoUnitario.setScale(2, RoundingMode.HALF_UP);
            if (unitario.signum() < 0)
                throw new RuntimeException("Produto " + produto + ": o desconto não pode ser negativo.");
            if (unitario.compareTo(valorUnitario) > 0)
                throw new RuntimeException("Produto " + produto + ": o desconto não pode ser maior que o valor unitário.");
            pct = valorUnitario.signum() > 0
                    ? unitario.multiply(CEM).divide(valorUnitario, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO.setScale(2);
        } else {
            pct = percentual != null ? percentual.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
            unitario = valorUnitario.multiply(pct).divide(CEM, 2, RoundingMode.HALF_UP);
        }
        return new DescontoItem(pct, unitario, unitario.multiply(quantidade).setScale(2, RoundingMode.HALF_UP));
    }

    // Desconto unitário de um item já gravado (o banco guarda o desconto total do item)
    public static BigDecimal unitarioDe(BigDecimal descontoTotal, BigDecimal quantidade) {
        if (descontoTotal == null || quantidade == null || quantidade.signum() == 0) return BigDecimal.ZERO.setScale(2);
        return descontoTotal.divide(quantidade, 2, RoundingMode.HALF_UP);
    }
}
