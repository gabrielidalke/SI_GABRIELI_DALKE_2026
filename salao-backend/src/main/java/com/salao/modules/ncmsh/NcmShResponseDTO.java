package com.salao.modules.ncmsh;

import java.math.BigDecimal;

import java.time.LocalDateTime;

public record NcmShResponseDTO(
        Long id,
        String codigo,
        String descricao,
        BigDecimal aliquotaIcms,
        BigDecimal aliquotaIpi,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static NcmShResponseDTO from(NcmSh n) {
        return new NcmShResponseDTO(n.getId(), n.getCodigo(), n.getDescricao(), n.getAliquotaIcms(), n.getAliquotaIpi(), n.getAtivo(), n.getCriadoEm());
    }
}
