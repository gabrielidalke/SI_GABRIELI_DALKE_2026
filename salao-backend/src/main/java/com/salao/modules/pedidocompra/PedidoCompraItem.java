package com.salao.modules.pedidocompra;

import com.salao.modules.classificacaoconta.ClassificacaoConta;
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

    // Obrigatória nos pedidos novos; a Nota de Entrada já nasce com a classificação escolhida aqui
    @ManyToOne
    @JoinColumn(name = "classificacao_conta_id")
    private ClassificacaoConta classificacaoConta;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    @Column(name = "valor_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorUnitario;

    // O percentual é a fonte da verdade; o valor é sempre recalculado no backend
    @Builder.Default
    @Column(name = "desconto_percentual", nullable = false, precision = 5, scale = 2)
    private BigDecimal descontoPercentual = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "desconto_valor", nullable = false, precision = 12, scale = 2)
    private BigDecimal descontoValor = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "quantidade_recebida", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidadeRecebida = BigDecimal.ZERO;
}
