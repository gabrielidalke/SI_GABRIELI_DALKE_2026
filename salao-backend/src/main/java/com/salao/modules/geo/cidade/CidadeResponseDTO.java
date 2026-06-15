package com.salao.modules.geo.cidade;

import java.time.LocalDateTime;

public record CidadeResponseDTO(
        Long id,
        String nome,
        Long estadoId,
        String estadoNome,
        String estadoUf,
        Boolean ativo,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {
    public static CidadeResponseDTO from(Cidade c) {
        return new CidadeResponseDTO(
                c.getId(), c.getNome(),
                c.getEstado() != null ? c.getEstado().getId() : null,
                c.getEstado() != null ? c.getEstado().getNome() : null,
                c.getEstado() != null ? c.getEstado().getUf() : null,
                c.getAtivo(), c.getDataCriacao(), c.getDataAtualizacao()
        );
    }
}
