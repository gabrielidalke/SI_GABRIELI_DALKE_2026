package com.salao.modules.pagamento;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "formas_pagamento")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormaPagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "forma_pagamento", nullable = false, length = 100)
    private String formaPagamento;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal percentual = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "numero_dias")
    private Integer numeroDias = 0;

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
