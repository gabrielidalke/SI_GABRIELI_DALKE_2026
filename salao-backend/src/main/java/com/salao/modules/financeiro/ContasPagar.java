package com.salao.modules.financeiro;

import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.pagamento.Parcela;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas_pagar")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContasPagar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String descricao;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_vencimento", nullable = false)
    private LocalDate dataVencimento;

    @Column(name = "data_pagamento")
    private LocalDate dataPagamento;

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
    @Column(name = "valor_desconto", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_multa", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorMulta = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "valor_juro", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorJuro = BigDecimal.ZERO;

    @Column(name = "valor_pago", precision = 12, scale = 2)
    private BigDecimal valorPago;

    @Builder.Default
    @Column(length = 20)
    private String situacao = "ABERTA";

    @Builder.Default
    private Boolean ativo = true;

    // Conta gerada pela confirmação de uma Nota de Entrada (as quatro colunas da chave vêm juntas)
    public boolean veioDeNota() {
        return notaNumero != null;
    }

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;

    @ManyToOne
    @JoinColumn(name = "parcela_id")
    private Parcela parcela;

    // Nota de Entrada que originou a conta (chave composta; nulos quando a conta foi lançada manualmente)
    @Column(name = "nota_numero")
    private Integer notaNumero;

    @Column(name = "nota_serie")
    private Integer notaSerie;

    @Column(name = "nota_modelo")
    private Integer notaModelo;

    @Column(name = "nota_fornecedor_id")
    private Long notaFornecedorId;
}
