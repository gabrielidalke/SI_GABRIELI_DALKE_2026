package com.salao.modules.notaentrada;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// A situação NÃO vem do cliente: toda nota nova nasce PENDENTE, definido pelo backend.
// Os valores totais também são sempre recalculados no backend.
public record NotaEntradaRequestDTO(
        @NotNull(message = "Modelo é obrigatório")
        @Positive(message = "Modelo deve ser maior que zero") Integer modelo,
        @NotNull(message = "Série é obrigatória")
        @Positive(message = "Série deve ser maior que zero") Integer serie,
        @NotNull(message = "Número é obrigatório")
        @Positive(message = "Número deve ser maior que zero") Integer numero,
        @NotNull(message = "Fornecedor é obrigatório") Long fornecedorId,
        @NotNull(message = "Data de emissão é obrigatória") LocalDate dataEmissao,
        LocalDate dataChegada,
        @Pattern(regexp = "CIF|FOB", message = "Tipo de frete deve ser CIF ou FOB") String tipoFrete,
        @PositiveOrZero(message = "Valor do frete não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Valor do frete inválido (máximo 2 decimais)") BigDecimal valorFrete,
        @PositiveOrZero(message = "Valor do seguro não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Valor do seguro inválido (máximo 2 decimais)") BigDecimal valorSeguro,
        @PositiveOrZero(message = "Outras despesas não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Outras despesas inválido (máximo 2 decimais)") BigDecimal outrasDespesas,
        Long condicaoPagamentoId,
        Long transportadoraId,
        @Pattern(regexp = "[A-Za-z]{3}-?\\d[A-Za-z0-9]\\d{2}", message = "Placa inválida (use ABC-1234 ou ABC1D23)") String placaVeiculo,
        @Size(max = 500, message = "Observações deve ter no máximo 500 caracteres") String observacoes,
        Integer pedidoNumero,
        Integer pedidoSerie,
        Integer pedidoModelo,
        @Valid List<NotaEntradaItemRequestDTO> itens
) {}
