package com.salao.modules.classificacaoconta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassificacaoContaDTO(
        Long id,
        @NotBlank(message = "Nome da classificação é obrigatório") @Size(min = 3, max = 60, message = "Nome da classificação deve ter entre 3 e 60 letras") String nome,
        Boolean ativo
) {}
