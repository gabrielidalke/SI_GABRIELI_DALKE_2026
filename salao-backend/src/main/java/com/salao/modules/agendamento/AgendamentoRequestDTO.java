package com.salao.modules.agendamento;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record AgendamentoRequestDTO(
        @NotNull LocalDateTime dataHora,
        String observacao,
        @NotNull Long clienteId,
        @NotNull Long funcionarioId,
        @NotEmpty List<Long> servicoIds
) {}
