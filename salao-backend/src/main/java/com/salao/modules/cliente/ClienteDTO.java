package com.salao.modules.cliente;


import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record ClienteDTO(
        Long id,
        @NotBlank String nome,
        String apelido,
        String email,
        String telefone,
        String endereco,
        String numero,
        String complemento,
        String bairro,
        String cep,
        String cpf,
        String rg,
        LocalDate dataNascimento,
        String sexo,
        String estadoCivil,
        String observacao,
        Boolean ativo
) {}