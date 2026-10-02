package com.salao.modules.pedidocompra;

import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.pagamento.CondicaoPagamento;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos_compra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoCompra {

    @EmbeddedId
    private PedidoCompraId id;

    // Somente leitura: a coluna fornecedor_id já faz parte da chave
    @ManyToOne
    @JoinColumn(name = "fornecedor_id", insertable = false, updatable = false)
    private Fornecedor fornecedor;

    @Column(name = "data_pedido", nullable = false)
    private LocalDate dataPedido;

    @Column(length = 500)
    private String observacoes;

    // Vem do fornecedor ao escolhê-lo, mas pode ser trocada
    @ManyToOne
    @JoinColumn(name = "condicao_pagamento_id")
    private CondicaoPagamento condicaoPagamento;

    @Builder.Default
    @Column(name = "valor_frete", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorFrete = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_seguro", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorSeguro = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "outras_despesas", nullable = false, precision = 12, scale = 2)
    private BigDecimal outrasDespesas = BigDecimal.ZERO;

    // ABERTA, PARCIAL ou CONCLUIDA (recalculada a partir das quantidades recebidas)
    @Builder.Default
    @Column(nullable = false, length = 10)
    private String situacao = "ABERTA";

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
