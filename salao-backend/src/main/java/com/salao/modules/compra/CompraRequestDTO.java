package com.salao.modules.compra;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record CompraRequestDTO(
        String numeroCompra,
        @NotNull LocalDate dataCompra,
        String observacao,
        @NotNull Long fornecedorId,
        @NotEmpty List<CompraItemRequestDTO> itens
) {}
