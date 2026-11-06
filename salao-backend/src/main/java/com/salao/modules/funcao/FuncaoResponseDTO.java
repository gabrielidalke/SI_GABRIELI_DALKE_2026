package com.salao.modules.funcao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FuncaoResponseDTO(
        Long id,
        String funcao,
        BigDecimal salarioBase,
        Boolean ativo,
        LocalDateTime criadoEm
) {
    public static FuncaoResponseDTO from(Funcao f) {
        return new FuncaoResponseDTO(f.getId(), f.getFuncao(), f.getSalarioBase(), f.getAtivo(), f.getCriadoEm());
    }
}
