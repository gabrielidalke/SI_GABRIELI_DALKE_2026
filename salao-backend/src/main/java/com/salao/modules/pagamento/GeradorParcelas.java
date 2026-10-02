package com.salao.modules.pagamento;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * Divide um valor total nas parcelas de uma condição de pagamento. É a ÚNICA fonte desse cálculo:
 * a prévia "Gerar Parcelas" da tela e a geração das Contas a Pagar na confirmação da nota usam este mesmo código,
 * então o que a pessoa vê é exatamente o que será lançado.
 *
 * Regras: valor da parcela = total x percentual / 100 (2 casas); a última parcela absorve o arredondamento;
 * vencimento = data base + dias da parcela. Sem condição (ou sem parcelas): uma única parcela, na data base.
 */
public final class GeradorParcelas {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private GeradorParcelas() {}

    // "parcela" é nula quando não há condição de pagamento (parcela única na data base)
    public record ParcelaCalculada(int numero, int total, Parcela parcela, int diasVencimento,
                                   BigDecimal percentual, LocalDate dataVencimento, BigDecimal valor) {}

    public static List<ParcelaCalculada> calcular(CondicaoPagamento condicao, BigDecimal total, LocalDate base) {
        List<Parcela> parcelas = condicao != null ? condicao.getParcelas() : null;

        if (parcelas == null || parcelas.isEmpty())
            return List.of(new ParcelaCalculada(1, 1, null, 0, CEM, base, total));

        var ordenadas = parcelas.stream()
                .sorted(Comparator.comparing(p -> p.getNumeroParcela() != null ? p.getNumeroParcela() : 0))
                .toList();

        BigDecimal acumulado = BigDecimal.ZERO;
        int quantidade = ordenadas.size();
        var resultado = new java.util.ArrayList<ParcelaCalculada>();

        for (int i = 0; i < quantidade; i++) {
            var parcela = ordenadas.get(i);
            BigDecimal percentual = parcela.getPercentual() != null ? parcela.getPercentual() : BigDecimal.ZERO;
            BigDecimal valor;
            if (i == quantidade - 1) {
                valor = total.subtract(acumulado);
            } else {
                valor = total.multiply(percentual).divide(CEM, 2, RoundingMode.HALF_UP);
                acumulado = acumulado.add(valor);
            }
            int dias = parcela.getDiasVencimento() != null ? parcela.getDiasVencimento() : 0;
            resultado.add(new ParcelaCalculada(i + 1, quantidade, parcela, dias, percentual, base.plusDays(dias), valor));
        }
        return resultado;
    }
}
