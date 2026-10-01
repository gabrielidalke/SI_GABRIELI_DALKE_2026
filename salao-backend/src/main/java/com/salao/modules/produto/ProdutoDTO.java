package com.salao.modules.produto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record ProdutoDTO(
        Long id,
        @NotBlank(message = "Nome do produto é obrigatório") String nome,
        String descricao,
        @NotNull(message = "Valor de venda é obrigatório") @Positive(message = "Valor de venda deve ser maior que zero") BigDecimal precoVenda,
        @PositiveOrZero(message = "Quantidade não pode ser negativa") Integer quantidade,
        Boolean ativo,
        Long ncmShId,
        Long marcaId,
        Long unidadeMedidaId,
        Long categoriaId,
        @PositiveOrZero(message = "Preço de custo não pode ser negativo") BigDecimal precoCusto,
        @DecimalMin(value = "0", message = "Desconto deve estar entre 0 e 100%")
        @DecimalMax(value = "100", message = "Desconto deve estar entre 0 e 100%")
        BigDecimal desconto
) {}