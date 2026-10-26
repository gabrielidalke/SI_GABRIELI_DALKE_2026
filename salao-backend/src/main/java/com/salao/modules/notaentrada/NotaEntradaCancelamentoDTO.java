package com.salao.modules.notaentrada;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// Todo cancelamento exige o motivo (fica registrado na nota e no log)
public record NotaEntradaCancelamentoDTO(
        @NotBlank(message = "O motivo do cancelamento é obrigatório")
        @Size(max = 300, message = "O motivo deve ter no máximo 300 caracteres") String motivo
) {}
