package com.salao.modules.ncmsh;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record NcmShRequestDTO(
        @NotBlank(message = "Código NCM/SH é obrigatório")
        @Pattern(regexp = "\\d{4}\\.?\\d{2}\\.?\\d{2}", message = "Código NCM/SH inválido (formato esperado: 9999.99.99)")
        String codigo,
        String descricao,
        Boolean ativo
) {}
