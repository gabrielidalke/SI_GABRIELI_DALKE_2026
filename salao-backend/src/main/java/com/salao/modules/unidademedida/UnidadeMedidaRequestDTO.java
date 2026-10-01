package com.salao.modules.unidademedida;

import jakarta.validation.constraints.NotBlank;

public record UnidadeMedidaRequestDTO(
        @NotBlank(message = "Nome da unidade é obrigatório") String unidadeMedida,
        @NotBlank(message = "Sigla é obrigatória") String sigla,
        Boolean ativo
) {}
