package com.salao.modules.pagamento;

import jakarta.validation.constraints.NotNull;

public record ParcelaRequestDTO(
        @NotNull Integer numeroDias,
        Long formaPagamentoId,
        Long condicaoPagamentoId,
        Boolean ativo
) {}
