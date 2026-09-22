package com.salao.modules.produto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,
        @NotBlank String nome,
        String descricao,
        @NotNull @Positive BigDecimal precoVenda,
        Integer quantidade,
        Boolean ativo,
        Long ncmShId,
        Long marcaId,
        Long unidadeMedidaId,
        Long categoriaId,
        BigDecimal precoCusto,
        BigDecimal desconto
) {}