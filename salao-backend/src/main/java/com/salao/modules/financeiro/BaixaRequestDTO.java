package com.salao.modules.financeiro;

import java.time.LocalDate;

// Data em que a conta foi paga/recebida; nula = hoje
public record BaixaRequestDTO(LocalDate data) {}
