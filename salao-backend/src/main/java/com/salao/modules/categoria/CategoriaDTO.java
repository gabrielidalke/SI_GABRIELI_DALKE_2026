package com.salao.modules.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaDTO(
        Long id,
        @NotBlank(message = "Nome da categoria é obrigatório") @Size(min = 3, max = 60, message = "Nome da categoria deve ter entre 3 e 60 letras") String nome,
        Boolean ativo
) {}