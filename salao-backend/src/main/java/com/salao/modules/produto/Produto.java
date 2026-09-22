package com.salao.modules.produto;


import com.salao.modules.categoria.Categoria;
import com.salao.modules.marca.Marca;
import com.salao.modules.ncmsh.NcmSh;
import com.salao.modules.unidademedida.UnidadeMedida;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @NotBlank
    private String nome;

    @Column(length = 255)
    private String descricao;

    @Column(name = "preco_venda", nullable = false, precision = 10, scale = 2)
    @NotNull
    private BigDecimal precoVenda;

    @Builder.Default
    private Integer quantidade = 0;

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @Column(name = "preco_custo", precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal desconto = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "ncm_sh_id")
    private NcmSh ncmSh;

    @ManyToOne
    @JoinColumn(name = "marca_id")
    private Marca marca;

    @ManyToOne
    @JoinColumn(name = "unidade_medida_id")
    private UnidadeMedida unidadeMedida;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;
}