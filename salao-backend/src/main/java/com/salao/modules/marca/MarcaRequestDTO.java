package com.salao.modules.marca;

import jakarta.validation.constraints.NotBlank;

public record MarcaRequestDTO(
        @NotBlank(message = "Nome da marca é obrigatório") String marca,
        Boolean ativo
) {}
