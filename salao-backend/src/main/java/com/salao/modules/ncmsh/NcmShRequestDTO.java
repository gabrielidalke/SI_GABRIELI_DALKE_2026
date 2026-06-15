package com.salao.modules.ncmsh;

import jakarta.validation.constraints.NotBlank;

public record NcmShRequestDTO(
        @NotBlank String codigo,
        String descricao,
        Boolean ativo
) {}
