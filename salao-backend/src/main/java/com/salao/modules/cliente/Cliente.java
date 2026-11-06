package com.salao.modules.cliente;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.salao.modules.geo.cidade.Cidade;
import com.salao.modules.pagamento.CondicaoPagamento;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    @NotBlank
    private String nome;

    @ManyToOne
    @JoinColumn(name = "cidade_id")
    private Cidade cidade;

    @Column(length = 60)
    private String apelido;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String telefone;

    @Column(length = 200)
    private String endereco;

    @Column(length = 5)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(length = 50)
    private String bairro;

    @Column(length = 9)
    private String cep;

    // FISICA (CPF + RG) ou JURIDICA (CNPJ + Inscrição Estadual)
    @Builder.Default
    @Column(name = "tipo_pessoa", nullable = false, length = 8)
    private String tipoPessoa = "FISICA";

    @Column(name = "cpf_cnpj", length = 18, unique = true)
    private String cpfCnpj;

    @Column(length = 14)
    private String rg;

    @Column(name = "inscricao_estadual", length = 20)
    private String inscricaoEstadual;

    // as parcelas da condição não vão junto no JSON do cliente
    @ManyToOne
    @JoinColumn(name = "condicao_pagamento_id")
    @JsonIgnoreProperties({"parcelas", "hibernateLazyInitializer", "handler"})
    private CondicaoPagamento condicaoPagamento;

    @Builder.Default
    @Column(name = "limite_credito", nullable = false, precision = 12, scale = 2)
    private BigDecimal limiteCredito = BigDecimal.ZERO;

    @Column(name = "data_nascimento")
    private LocalDate dataNascimento;

    @Column(length = 1)
    private String sexo;

    @Column(name = "estado_civil", length = 20)
    private String estadoCivil;

    @Column(length = 255)
    private String observacao;

    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}