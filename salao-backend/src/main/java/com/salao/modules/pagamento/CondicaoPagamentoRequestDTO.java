package com.salao.modules.pagamento;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record CondicaoPagamentoRequestDTO(
        @NotBlank(message = "Condição de pagamento é obrigatória") String condicao,
        BigDecimal multa,
        BigDecimal juro,
        BigDecimal desconto,
        Boolean ativo,
        @Valid List<ParcelaRequestDTO> parcelas
) {}
