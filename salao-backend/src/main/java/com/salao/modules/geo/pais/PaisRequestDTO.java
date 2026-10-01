package com.salao.modules.geo.pais;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PaisRequestDTO(
        @NotBlank(message = "Nome do país é obrigatório")
        @Size(max = 100)
        String nome,

        @NotBlank(message = "Sigla é obrigatória")
        @Size(min = 2, max = 3, message = "Sigla deve ter 2 ou 3 letras")
        String sigla,

        @Size(max = 100)
        String nacionalidade,

        @Size(max = 50)
        String moeda,

        Boolean ativo
) {}
