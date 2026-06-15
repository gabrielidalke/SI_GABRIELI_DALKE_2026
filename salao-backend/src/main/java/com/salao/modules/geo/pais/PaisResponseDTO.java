package com.salao.modules.geo.pais;

import java.time.LocalDateTime;

public record PaisResponseDTO(
        Long id,
        String nome,
        String sigla,
        String nacionalidade,
        String moeda,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
    public static PaisResponseDTO from(Pais p) {
        return new PaisResponseDTO(
                p.getId(), p.getNome(), p.getSigla(), p.getNacionalidade(), p.getMoeda(),
                p.getAtivo(), p.getDataCriacao(), p.getDataAtualizacao()
        );
    }
}
