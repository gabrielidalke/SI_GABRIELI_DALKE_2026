package com.salao.modules.servico;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ServicoDTO(
        Long id,
        @NotBlank(message = "Nome do serviço é obrigatório") String nome,
        String descricao,
        @NotNull(message = "Duração é obrigatória") @Positive(message = "Duração deve ser maior que zero") Integer duracaoMin,
        @NotNull(message = "Preço é obrigatório") @Positive(message = "Preço deve ser maior que zero") BigDecimal preco,
        Boolean ativo
) {}