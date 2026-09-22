package com.salao.modules.unidademedida;

import java.time.LocalDateTime;

public record UnidadeMedidaResponseDTO(
        Long id,
        String unidadeMedida,
        String sigla,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static UnidadeMedidaResponseDTO from(UnidadeMedida u) {
        return new UnidadeMedidaResponseDTO(u.getId(), u.getUnidadeMedida(), u.getSigla(), u.getAtivo(), u.getCriadoEm());
    }
}
