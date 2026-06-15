package com.salao.modules.produto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        BigDecimal preco,
        Integer quantidade,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        NcmShInfo ncmSh
) {
    public record NcmShInfo(Long id, String codigo, String descricao) {}

    public static ProdutoResponseDTO from(Produto p) {
        NcmShInfo ncmSh = p.getNcmSh() != null
                ? new NcmShInfo(p.getNcmSh().getId(), p.getNcmSh().getCodigo(), p.getNcmSh().getDescricao())
                : null;
        return new ProdutoResponseDTO(
                p.getId(), p.getNome(), p.getDescricao(), p.getPreco(),
                p.getQuantidade(), p.getAtivo(), p.getCriadoEm(), p.getAtualizadoEm(),
                ncmSh
        );
    }
}
