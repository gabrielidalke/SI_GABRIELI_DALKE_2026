package com.salao.modules.pedidocompra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PedidoCompraRequestDTO(
        @NotNull(message = "Modelo do pedido é obrigatório")
        @Positive(message = "Modelo do pedido deve ser maior que zero") Integer modelo,
        @NotNull(message = "Série do pedido é obrigatória")
        @Positive(message = "Série do pedido deve ser maior que zero") Integer serie,
        @NotNull(message = "Número do pedido é obrigatório")
        @Positive(message = "Número do pedido deve ser maior que zero") Integer numero,
        @NotNull(message = "Fornecedor é obrigatório") Long fornecedorId,
        @NotNull(message = "Data do pedido é obrigatória") LocalDate dataPedido,
        @Size(max = 500, message = "Observações deve ter no máximo 500 caracteres") String observacoes,
        Long condicaoPagamentoId,
        @PositiveOrZero(message = "Valor do frete não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Valor do frete inválido (máximo 2 decimais)") BigDecimal valorFrete,
        @PositiveOrZero(message = "Valor do seguro não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Valor do seguro inválido (máximo 2 decimais)") BigDecimal valorSeguro,
        @PositiveOrZero(message = "Outras despesas não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Outras despesas inválido (máximo 2 decimais)") BigDecimal outrasDespesas,
        @NotEmpty(message = "Adicione pelo menos um produto ao pedido") @Valid List<PedidoCompraItemRequestDTO> itens
) {}
