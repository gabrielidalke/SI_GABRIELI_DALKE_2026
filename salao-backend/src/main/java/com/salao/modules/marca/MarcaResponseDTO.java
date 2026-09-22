package com.salao.modules.marca;

import java.time.LocalDateTime;

public record MarcaResponseDTO(
        Long id,
        String marca,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static MarcaResponseDTO from(Marca m) {
        return new MarcaResponseDTO(m.getId(), m.getMarca(), m.getAtivo(), m.getCriadoEm());
    }
}
