package com.salao.modules.pedidocompra;

import com.salao.modules.produto.Produto;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "pedidos_compra_itens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoCompraItem {

    @EmbeddedId
    private PedidoCompraItemId id;

    // Somente leitura: produto_id já faz parte da chave
    @ManyToOne
    @JoinColumn(name = "produto_id", insertable = false, updatable = false)
    private Produto produto;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    @Column(name = "valor_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorUnitario;

    @Builder.Default
    @Column(name = "quantidade_recebida", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeRecebida = BigDecimal.ZERO;
}
