package com.salao.modules.pedidocompra;

import com.salao.modules.fornecedor.Fornecedor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
