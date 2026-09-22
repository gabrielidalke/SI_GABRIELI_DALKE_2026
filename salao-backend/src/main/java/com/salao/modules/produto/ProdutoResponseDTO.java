package com.salao.modules.produto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponseDTO(
        Long id,
        String nome,
        String descricao,
        BigDecimal precoVenda,
        BigDecimal precoCusto,
        BigDecimal desconto,
        Integer quantidade,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        NcmShInfo ncmSh,
        MarcaInfo marca,
        UnidadeMedidaInfo unidadeMedida,
        CategoriaInfo categoria
) {
    public record NcmShInfo(Long id, String codigo, String descricao) {}
    public record MarcaInfo(Long id, String marca) {}
    public record UnidadeMedidaInfo(Long id, String unidadeMedida, String sigla) {}
    public record CategoriaInfo(Long id, String nome) {}

    public static ProdutoResponseDTO from(Produto p) {
        NcmShInfo ncmSh = p.getNcmSh() != null
                ? new NcmShInfo(p.getNcmSh().getId(), p.getNcmSh().getCodigo(), p.getNcmSh().getDescricao())
                : null;
        MarcaInfo marca = p.getMarca() != null
                ? new MarcaInfo(p.getMarca().getId(), p.getMarca().getMarca())
                : null;
        UnidadeMedidaInfo unidade = p.getUnidadeMedida() != null
                ? new UnidadeMedidaInfo(p.getUnidadeMedida().getId(), p.getUnidadeMedida().getUnidadeMedida(), p.getUnidadeMedida().getSigla())
                : null;
        CategoriaInfo categoria = p.getCategoria() != null
                ? new CategoriaInfo(p.getCategoria().getId(), p.getCategoria().getNome())
                : null;
        return new ProdutoResponseDTO(
                p.getId(), p.getNome(), p.getDescricao(), p.getPrecoVenda(),
                p.getPrecoCusto(), p.getDesconto(),
                p.getQuantidade(), p.getAtivo(), p.getCriadoEm(), p.getAtualizadoEm(),
                ncmSh, marca, unidade, categoria
        );
    }
}
