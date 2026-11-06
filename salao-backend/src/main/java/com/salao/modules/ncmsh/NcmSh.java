package com.salao.modules.ncmsh;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ncm_sh")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NcmSh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(length = 200)
    private String descricao;

    @Builder.Default
    @Column(name = "aliquota_icms", nullable = false, precision = 5, scale = 2)
    private BigDecimal aliquotaIcms = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "aliquota_ipi", nullable = false, precision = 5, scale = 2)
    private BigDecimal aliquotaIpi = BigDecimal.ZERO;

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}
