package com.salao.modules.transportadora;

import com.salao.modules.geo.cidade.Cidade;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "transportadoras")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transportadora {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "cpf_cnpj", length = 18)
    private String cpfCnpj;

    @Column(length = 15)
    private String fone;

    @Column(length = 200)
    private String endereco;

    @Column(length = 100)
    private String bairro;

    @Column(length = 9)
    private String cep;

    // FISICA (CPF + RG) ou JURIDICA (CNPJ + Inscrição Estadual)
    @Builder.Default
    @Column(name = "tipo_pessoa", nullable = false, length = 8)
    private String tipoPessoa = "JURIDICA";

    @Column(name = "nome_fantasia", length = 150)
    private String nomeFantasia;

    @Column(length = 20)
    private String rg;

    @Column(name = "inscricao_estadual", length = 20)
    private String inscricaoEstadual;

    @Column(name = "insc_est_subst_trib", length = 20)
    private String inscEstSubstTrib;

    @Column(length = 10)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 150)
    private String email;

    @Column(length = 150)
    private String site;

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @ManyToOne
    @JoinColumn(name = "cidade_id")
    private Cidade cidade;
}
