package com.salao.modules.ncmsh;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record NcmShRequestDTO(
        @NotBlank(message = "Código NCM/SH é obrigatório")
        @Pattern(regexp = "\\d{4}\\.?\\d{2}\\.?\\d{2}", message = "Código NCM/SH inválido (formato esperado: 9999.99.99)")
        String codigo,
        String descricao,
        @DecimalMin(value = "0", message = "Alíquota de ICMS deve estar entre 0 e 100%")
        @DecimalMax(value = "100", message = "Alíquota de ICMS deve estar entre 0 e 100%")
        @Digits(integer = 3, fraction = 2, message = "Alíquota de ICMS inválida (máximo 2 decimais)")
        BigDecimal aliquotaIcms,
        @DecimalMin(value = "0", message = "Alíquota de IPI deve estar entre 0 e 100%")
        @DecimalMax(value = "100", message = "Alíquota de IPI deve estar entre 0 e 100%")
        @Digits(integer = 3, fraction = 2, message = "Alíquota de IPI inválida (máximo 2 decimais)")
        BigDecimal aliquotaIpi,
        Boolean ativo
) {}
