package com.salao.modules.cliente;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

    @Column(length = 14, unique = true)
    private String cpf;

    @Column(length = 14)
    private String rg;

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