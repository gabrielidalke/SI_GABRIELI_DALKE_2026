package com.salao.modules.pagamento;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;

public record CondicaoPagamentoRequestDTO(
        @NotBlank String condicao,
        BigDecimal multa,
        BigDecimal juro,
        BigDecimal desconto,
        Boolean ativo,
        List<ParcelaRequestDTO> parcelas
) {}
