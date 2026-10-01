package com.salao.modules.financeiro;

import com.salao.modules.cliente.Cliente;
import com.salao.modules.fiscal.saida.NotaFiscalSaida;
import com.salao.modules.pagamento.Parcela;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas_receber")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContasReceber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_recebimento")
    private LocalDate dataRecebimento;

    // Termos da condição de pagamento, copiados quando a conta é lançada
    @Builder.Default
    @Column(name = "percentual_desconto", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualDesconto = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "percentual_multa", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualMulta = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "percentual_juro", nullable = false, precision = 5, scale = 2)
    private BigDecimal percentualJuro = BigDecimal.ZERO;

    // Resultado da baixa (ver CalculoBaixa)
    @Builder.Default
    @Column(name = "valor_desconto", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_multa", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMulta = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_juro", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorJuro = BigDecimal.ZERO;

    @Column(name = "valor_recebido", precision = 10, scale = 2)
    private BigDecimal valorRecebido;

    @Builder.Default
    @Column(length = 20)
    private String situacao = "ABERTA";

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "parcela_id")
    private Parcela parcela;

    @ManyToOne
    @JoinColumn(name = "nota_fiscal_saida_id")
    private NotaFiscalSaida notaFiscalSaida;
}
