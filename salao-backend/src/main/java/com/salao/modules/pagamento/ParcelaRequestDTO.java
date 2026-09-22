package com.salao.modules.pagamento;

import jakarta.validation.constraints.NotNull;

public record ParcelaRequestDTO(
        Integer numeroParcela,
        @NotNull Integer diasVencimento,
        Long formaPagamentoId,
        Long condicaoPagamentoId,
        Boolean ativo
) {}
