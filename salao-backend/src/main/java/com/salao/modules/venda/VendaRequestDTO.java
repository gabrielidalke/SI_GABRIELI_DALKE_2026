package com.salao.modules.venda;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record VendaRequestDTO(
        String numeroVenda,
        @NotNull(message = "Data da venda é obrigatória") LocalDate dataVenda,
        String observacao,
        @NotNull(message = "Cliente é obrigatório") Long clienteId,
        Long condicaoPagamentoId,
        @NotEmpty(message = "Adicione pelo menos um item") @Valid List<VendaItemRequestDTO> itens
) {}
