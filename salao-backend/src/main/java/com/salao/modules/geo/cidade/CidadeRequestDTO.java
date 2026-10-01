package com.salao.modules.geo.cidade;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CidadeRequestDTO(
        @NotBlank(message = "Nome é obrigatório")
        @Size(max = 100)
        String nome,

        @NotNull(message = "Estado é obrigatório")
        Long estadoId,
        Boolean ativo
) {}
