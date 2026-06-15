package com.salao.modules.geo.estado;

import java.time.LocalDateTime;

public record EstadoResponseDTO(
        Long id,
        String nome,
        String uf,
        Long paisId,
        String paisNome,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
    public static EstadoResponseDTO from(Estado e) {
        return new EstadoResponseDTO(
                e.getId(), e.getNome(), e.getUf(),
                e.getPais() != null ? e.getPais().getId() : null,
                e.getPais() != null ? e.getPais().getNome() : null,
                e.getAtivo(), e.getDataCriacao(), e.getDataAtualizacao()
        );
    }
}
