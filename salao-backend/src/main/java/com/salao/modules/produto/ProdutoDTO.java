package com.salao.modules.produto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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
        BigDecimal desconto,
        @PositiveOrZero(message = "Peso bruto não pode ser negativo")
        @Digits(integer = 7, fraction = 3, message = "Peso bruto inválido (máximo 3 decimais)") BigDecimal pesoBruto,
        @PositiveOrZero(message = "Peso líquido não pode ser negativo")
        @Digits(integer = 7, fraction = 3, message = "Peso líquido inválido (máximo 3 decimais)") BigDecimal pesoLiquido,
        @PositiveOrZero(message = "Quantidade mínima não pode ser negativa") Integer quantidadeMinima
) {}