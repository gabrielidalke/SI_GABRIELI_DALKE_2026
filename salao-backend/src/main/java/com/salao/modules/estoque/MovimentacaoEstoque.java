package com.salao.modules.estoque;

import com.salao.modules.produto.Produto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimentacoes_estoque")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false, length = 10)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantidade;

    @Column(name = "saldo_anterior")
    private Integer saldoAnterior;

    // Saldo posterior ao movimento
    @Column(name = "saldo_resultante", nullable = false)
    private Integer saldoResultante;

    @Column(name = "custo_unitario", precision = 12, scale = 4)
    private BigDecimal custoUnitario;

    @Column(name = "origem_tipo", length = 20)
    private String origemTipo;

    @Column(name = "origem_id")
    private Long origemId;

    // Documento de origem legível (ex.: "Nota de Entrada 12345/1 (mod. 55) - Fornecedor 10")
    @Column(length = 120)
    private String documento;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;
}
