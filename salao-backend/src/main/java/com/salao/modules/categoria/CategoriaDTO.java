package com.salao.modules.categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaDTO(
        Long id,
        @NotBlank @Size(min = 3, max = 60) String nome,
        Boolean ativo
) {}