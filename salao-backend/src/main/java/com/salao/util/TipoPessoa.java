package com.salao.util;

/**
 * Pessoa física ou jurídica: regra comum de Cliente, Funcionário, Fornecedor e Transportadora
 * (igual ao projeto de referência). Física usa CPF e RG; jurídica usa CNPJ e Inscrição Estadual.
 */
public final class TipoPessoa {

    public static final String FISICA = "FISICA";
    public static final String JURIDICA = "JURIDICA";

    private TipoPessoa() {}

    // Aceita FISICA/JURIDICA (e F/J, PF/PJ). Sem tipo, deduz pelo documento (11 dígitos = CPF, 14 = CNPJ);
    // sem tipo e sem documento, vale o padrão do cadastro
    public static String normalizar(String tipo, String padrao, String cpfCnpj) {
        if (tipo == null || tipo.isBlank()) {
            String digitos = cpfCnpj == null ? "" : cpfCnpj.replaceAll("\\D", "");
            if (digitos.length() == 11) return FISICA;
            if (digitos.length() == 14) return JURIDICA;
            return padrao;
        }
        String t = tipo.trim().toUpperCase();
        if (t.equals("F") || t.equals("PF") || t.equals(FISICA)) return FISICA;
        if (t.equals("J") || t.equals("PJ") || t.equals(JURIDICA)) return JURIDICA;
        throw new RuntimeException("Tipo de pessoa inválido (use Física ou Jurídica).");
    }

    // Confere se o documento combina com o tipo (CPF para física, CNPJ para jurídica) e devolve formatado
    public static String documento(String tipo, String cpfCnpj) {
        if (cpfCnpj == null || cpfCnpj.isBlank()) return null;
        String digitos = cpfCnpj.replaceAll("\\D", "");
        if (FISICA.equals(tipo)) {
            if (digitos.length() != 11)
                throw new RuntimeException("Para pessoa física informe o CPF (11 dígitos).");
            if (!CpfCnpjValidator.validarCPF(cpfCnpj))
                throw new RuntimeException("CPF inválido.");
        } else {
            if (digitos.length() != 14)
                throw new RuntimeException("Para pessoa jurídica informe o CNPJ (14 dígitos).");
            if (!CpfCnpjValidator.validarCNPJ(cpfCnpj))
                throw new RuntimeException("CNPJ inválido.");
        }
        return CpfCnpjValidator.formatar(cpfCnpj);
    }

    // RG só para física; Inscrição Estadual (e IE Substituto Tributário) só para jurídica
    public static String soSeFisica(String tipo, String valor) {
        return FISICA.equals(tipo) ? vazioParaNulo(valor) : null;
    }

    public static String soSeJuridica(String tipo, String valor) {
        return JURIDICA.equals(tipo) ? vazioParaNulo(valor) : null;
    }

    public static String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
