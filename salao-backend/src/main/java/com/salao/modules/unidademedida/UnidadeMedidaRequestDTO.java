package com.salao.modules.unidademedida;

import jakarta.validation.constraints.NotBlank;

public record UnidadeMedidaRequestDTO(
        @NotBlank String unidadeMedida,
        @NotBlank String sigla,
        Boolean ativo
) {}
