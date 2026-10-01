package com.salao.modules.pedidocompra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

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
        @NotEmpty(message = "Adicione pelo menos um produto ao pedido") @Valid List<PedidoCompraItemRequestDTO> itens
) {}
