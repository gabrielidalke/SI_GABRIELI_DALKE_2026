package com.salao.modules.agendamento;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record AgendamentoRequestDTO(
        @NotNull(message = "Data e hora são obrigatórias") LocalDateTime dataHora,
        String observacao,
        @NotNull(message = "Cliente é obrigatório") Long clienteId,
        @NotNull(message = "Funcionário é obrigatório") Long funcionarioId,
        @NotEmpty(message = "Selecione pelo menos um serviço") List<Long> servicoIds
) {}
