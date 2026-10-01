package com.salao.modules.notaentrada;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record NotaEntradaResponseDTO(
        Integer modelo,
        Integer serie,
        Integer numero,
        FornecedorInfo fornecedor,
        LocalDate dataEmissao,
        LocalDate dataChegada,
        String tipoFrete,
        BigDecimal valorProdutos,
        BigDecimal valorFrete,
        BigDecimal valorSeguro,
        BigDecimal outrasDespesas,
        BigDecimal valorDesconto,
        BigDecimal valorTotal,
        CondicaoInfo condicaoPagamento,
        TransportadoraInfo transportadora,
        String placaVeiculo,
        String observacoes,
        String situacao,
        PedidoInfo pedido,
        List<ItemInfo> itens,
        LocalDateTime criadoEm
) {
    public record FornecedorInfo(Long id, String nome, Boolean ativo) {}
    public record CondicaoInfo(Long id, String condicao) {}
    public record TransportadoraInfo(Long id, String nome, Boolean ativo) {}
    public record PedidoInfo(Integer modelo, Integer serie, Integer numero) {}

    public record ItemInfo(
            Long produtoId, String produtoNome, String unidade,
            Long classificacaoContaId, String classificacaoNome,
            BigDecimal quantidade, BigDecimal valorUnitario, BigDecimal valorTotal,
            BigDecimal descontoPercentual, BigDecimal descontoValor,
            BigDecimal rateioFrete, BigDecimal rateioSeguro, BigDecimal rateioOutras,
            BigDecimal custoFinal
    ) {}

    public static PedidoInfo pedidoDe(NotaEntrada n) {
        return n.getPedidoNumero() != null && n.getPedidoSerie() != null && n.getPedidoModelo() != null
                ? new PedidoInfo(n.getPedidoModelo(), n.getPedidoSerie(), n.getPedidoNumero())
                : null;
    }

    public static NotaEntradaResponseDTO from(NotaEntrada n, List<NotaEntradaItem> itens) {
        var fornecedor = n.getFornecedor() != null
                ? new FornecedorInfo(n.getFornecedor().getId(), n.getFornecedor().getFornecedor(), n.getFornecedor().getAtivo())
                : new FornecedorInfo(n.getId().getFornecedorId(), null, null);
        var condicao = n.getCondicaoPagamento() != null
                ? new CondicaoInfo(n.getCondicaoPagamento().getId(), n.getCondicaoPagamento().getCondicao())
                : null;
        var transportadora = n.getTransportadora() != null
                ? new TransportadoraInfo(n.getTransportadora().getId(), n.getTransportadora().getNome(), n.getTransportadora().getAtivo())
                : null;
        var itensDto = itens.stream().map(i -> new ItemInfo(
                i.getId().getProdutoId(),
                i.getProduto() != null ? i.getProduto().getNome() : null,
                i.getProduto() != null && i.getProduto().getUnidadeMedida() != null
                        ? i.getProduto().getUnidadeMedida().getSigla() : null,
                i.getClassificacaoConta().getId(), i.getClassificacaoConta().getNome(),
                i.getQuantidade(), i.getValorUnitario(), i.getValorTotal(),
                i.getDescontoPercentual(), i.getDescontoValor(),
                i.getRateioFrete(), i.getRateioSeguro(), i.getRateioOutras(),
                i.getCustoFinal())).toList();
        return new NotaEntradaResponseDTO(
                n.getId().getModelo(), n.getId().getSerie(), n.getId().getNumero(), fornecedor,
                n.getDataEmissao(), n.getDataChegada(), n.getTipoFrete(),
                n.getValorProdutos(), n.getValorFrete(), n.getValorSeguro(), n.getOutrasDespesas(),
                n.getValorDesconto(), n.getValorTotal(),
                condicao, transportadora, n.getPlacaVeiculo(), n.getObservacoes(),
                n.getSituacao(), pedidoDe(n), itensDto, n.getCriadoEm());
    }
}
