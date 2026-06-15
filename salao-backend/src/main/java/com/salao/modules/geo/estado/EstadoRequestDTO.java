package com.salao.modules.geo.estado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EstadoRequestDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100)
        String nome,

        @NotBlank(message = "UF é obrigatória")
        @Size(max = 2)
        String uf,

        Long paisId,
        Boolean ativo
) {}
