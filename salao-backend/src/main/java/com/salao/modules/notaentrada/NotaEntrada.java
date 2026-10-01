package com.salao.modules.notaentrada;

import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.pagamento.CondicaoPagamento;
import com.salao.modules.transportadora.Transportadora;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_entrada")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaEntrada {

    @EmbeddedId
    private NotaEntradaId id;

    // Somente leitura: a coluna fornecedor_id já faz parte da chave
    @ManyToOne
    @JoinColumn(name = "fornecedor_id", insertable = false, updatable = false)
    private Fornecedor fornecedor;

    @Column(name = "data_emissao", nullable = false)
    private LocalDate dataEmissao;

    @Column(name = "data_chegada")
    private LocalDate dataChegada;

    // CIF ou FOB
    @Column(name = "tipo_frete", length = 3)
    private String tipoFrete;

    // Soma bruta dos produtos (quantidade x valor unitário), antes do desconto
    @Builder.Default
    @Column(name = "valor_produtos", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorProdutos = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_frete", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_seguro", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorSeguro = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "outras_despesas", nullable = false, precision = 12, scale = 2)
    private BigDecimal outrasDespesas = BigDecimal.ZERO;

    // Soma dos descontos dos itens
    @Builder.Default
    @Column(name = "valor_desconto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    // produtos - desconto + frete + seguro + outras despesas
    @Builder.Default
    @Column(name = "valor_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "condicao_pagamento_id")
    private CondicaoPagamento condicaoPagamento;

    @ManyToOne
    @JoinColumn(name = "transportadora_id")
    private Transportadora transportadora;

    @Column(name = "placa_veiculo", length = 10)
    private String placaVeiculo;

    @Column(length = 500)
    private String observacoes;

    // PENDENTE (editável/excluível/confirmável) ou CONFERIDA (efetivada; só leitura). Nasce sempre PENDENTE.
    @Builder.Default
    @Column(nullable = false, length = 10)
    private String situacao = "PENDENTE";

    // Pedido de Compra de origem (opcional): os três campos juntos, ou nenhum
    @Column(name = "pedido_numero")
    private Integer pedidoNumero;

    @Column(name = "pedido_serie")
    private Integer pedidoSerie;

    @Column(name = "pedido_modelo")
    private Integer pedidoModelo;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
