package com.salao.modules.ncmsh;

import java.time.LocalDateTime;

public record NcmShResponseDTO(
        Long id,
        String codigo,
        String descricao,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static NcmShResponseDTO from(NcmSh n) {
        return new NcmShResponseDTO(n.getId(), n.getCodigo(), n.getDescricao(), n.getAtivo(), n.getCriadoEm());
    }
}
