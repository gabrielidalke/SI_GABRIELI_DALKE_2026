package com.salao.modules.marca;

import jakarta.validation.constraints.NotBlank;

public record MarcaRequestDTO(
        @NotBlank String marca,
        Boolean ativo
) {}
