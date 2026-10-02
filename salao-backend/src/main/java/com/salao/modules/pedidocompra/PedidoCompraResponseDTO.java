package com.salao.modules.pedidocompra;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoCompraResponseDTO(
        Integer modelo,
        Integer serie,
        Integer numero,
        FornecedorInfo fornecedor,
        LocalDate dataPedido,
        String observacoes,
        String situacao,
        CondicaoInfo condicaoPagamento,
        BigDecimal valorProdutos,   // soma bruta (quantidade x valor unitário)
        BigDecimal valorDesconto,   // soma dos descontos dos itens
        BigDecimal valorLiquido,    // produtos - desconto
        BigDecimal valorFrete,
        BigDecimal valorSeguro,
        BigDecimal outrasDespesas,
        BigDecimal valorTotal,      // líquido + frete + seguro + outras despesas
        List<ItemInfo> itens,
        LocalDateTime criadoEm
) {
    public record FornecedorInfo(Long id, String nome, Boolean ativo) {}
    public record CondicaoInfo(Long id, String condicao) {}

    public record ItemInfo(Long produtoId, String produtoNome, String unidade,
                           Long classificacaoContaId, String classificacaoNome,
                           BigDecimal quantidade, BigDecimal valorUnitario, BigDecimal valorBruto,
                           BigDecimal descontoPercentual, BigDecimal descontoValor, BigDecimal valorLiquido,
                           BigDecimal quantidadeRecebida) {}

    public static PedidoCompraResponseDTO from(PedidoCompra p, List<PedidoCompraItem> itens) {
        var fornecedor = p.getFornecedor() != null
                ? new FornecedorInfo(p.getFornecedor().getId(), p.getFornecedor().getFornecedor(), p.getFornecedor().getAtivo())
                : new FornecedorInfo(p.getId().getFornecedorId(), null, null);
        var condicao = p.getCondicaoPagamento() != null
                ? new CondicaoInfo(p.getCondicaoPagamento().getId(), p.getCondicaoPagamento().getCondicao())
                : null;

        BigDecimal produtos = BigDecimal.ZERO;
        BigDecimal desconto = BigDecimal.ZERO;
        var itensDto = new java.util.ArrayList<ItemInfo>();
        for (var i : itens) {
            BigDecimal bruto = i.getQuantidade().multiply(i.getValorUnitario()).setScale(2, RoundingMode.HALF_UP);
            produtos = produtos.add(bruto);
            desconto = desconto.add(i.getDescontoValor());
            itensDto.add(new ItemInfo(
                    i.getId().getProdutoId(),
                    i.getProduto() != null ? i.getProduto().getNome() : null,
                    i.getProduto() != null && i.getProduto().getUnidadeMedida() != null
                            ? i.getProduto().getUnidadeMedida().getSigla() : null,
                    i.getClassificacaoConta() != null ? i.getClassificacaoConta().getId() : null,
                    i.getClassificacaoConta() != null ? i.getClassificacaoConta().getNome() : null,
                    i.getQuantidade(), i.getValorUnitario(), bruto,
                    i.getDescontoPercentual(), i.getDescontoValor(), bruto.subtract(i.getDescontoValor()),
                    i.getQuantidadeRecebida()));
        }
        BigDecimal liquido = produtos.subtract(desconto);
        BigDecimal total = liquido.add(p.getValorFrete()).add(p.getValorSeguro()).add(p.getOutrasDespesas());

        return new PedidoCompraResponseDTO(
                p.getId().getModelo(), p.getId().getSerie(), p.getId().getNumero(),
                fornecedor, p.getDataPedido(), p.getObservacoes(), p.getSituacao(), condicao,
                produtos, desconto, liquido, p.getValorFrete(), p.getValorSeguro(), p.getOutrasDespesas(), total,
                itensDto, p.getCriadoEm());
    }
}
