package com.salao.modules.venda;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record VendaRequestDTO(
        String numeroVenda,
        @NotNull LocalDate dataVenda,
        String observacao,
        @NotNull Long clienteId,
        @NotEmpty List<VendaItemRequestDTO> itens
) {}
