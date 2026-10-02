package com.salao.modules.pagamento;

import java.math.BigDecimal;
import java.time.LocalDate;

// Linha da prévia "Gerar Parcelas" (nada é gravado)
public record ParcelaPreviaDTO(
        int numero,
        int diasVencimento,
        BigDecimal percentual,
        String formaPagamento,
        LocalDate dataVencimento,
        BigDecimal valor
) {
    public static ParcelaPreviaDTO from(GeradorParcelas.ParcelaCalculada p) {
        String forma = p.parcela() != null && p.parcela().getFormaPagamento() != null
                ? p.parcela().getFormaPagamento().getFormaPagamento() : null;
        return new ParcelaPreviaDTO(p.numero(), p.diasVencimento(), p.percentual(), forma, p.dataVencimento(), p.valor());
    }
}
