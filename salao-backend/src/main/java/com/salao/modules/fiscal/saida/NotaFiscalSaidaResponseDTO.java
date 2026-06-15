package com.salao.modules.fiscal.saida;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NotaFiscalSaidaResponseDTO(
        Long id,
        String numeroNota,
        String serie,
        LocalDateTime dataEmissao,
        String chaveAcesso,
        BigDecimal valorTotal,
        String transportadoraNome,
        String veiculoPlaca,
        String observacao,
        VendaInfo venda,
        ClienteInfo cliente
) {
    public record VendaInfo(Long id, String numeroVenda) {}
    public record ClienteInfo(Long id, String nome) {}

    public static NotaFiscalSaidaResponseDTO from(NotaFiscalSaida n) {
        VendaInfo venda = n.getVenda() != null
                ? new VendaInfo(n.getVenda().getId(), n.getVenda().getNumeroVenda())
                : null;
        ClienteInfo cliente = n.getCliente() != null
                ? new ClienteInfo(n.getCliente().getId(), n.getCliente().getNome())
                : null;
        return new NotaFiscalSaidaResponseDTO(
                n.getId(), n.getNumeroNota(), n.getSerie(), n.getDataEmissao(),
                n.getChaveAcesso(), n.getValorTotal(), n.getTransportadoraNome(),
                n.getVeiculoPlaca(), n.getObservacao(), venda, cliente
        );
    }
}
