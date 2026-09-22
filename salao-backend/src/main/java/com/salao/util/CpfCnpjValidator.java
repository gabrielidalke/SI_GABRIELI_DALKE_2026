package com.salao.util;

public final class CpfCnpjValidator {

    private CpfCnpjValidator() {
    }

    public static boolean validarCPF(String cpf) {
        if (cpf == null) return false;
        String digitos = cpf.replaceAll("\\D", "");

        if (digitos.length() != 11) return false;
        if (todosDigitosIguais(digitos)) return false;

        int[] nums = paraInteiros(digitos);

        int soma = 0;
        for (int i = 0; i < 9; i++) {
            soma += nums[i] * (10 - i);
        }
        int digito1 = calcularDigito(soma);
        if (digito1 != nums[9]) return false;

        soma = 0;
        for (int i = 0; i < 10; i++) {
            soma += nums[i] * (11 - i);
        }
        int digito2 = calcularDigito(soma);
        return digito2 == nums[10];
    }

    public static boolean validarCNPJ(String cnpj) {
        if (cnpj == null) return false;
        String digitos = cnpj.replaceAll("\\D", "");

        if (digitos.length() != 14) return false;
        if (todosDigitosIguais(digitos)) return false;

        int[] nums = paraInteiros(digitos);

        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma = 0;
        for (int i = 0; i < 12; i++) {
            soma += nums[i] * pesos1[i];
        }
        int digito1 = calcularDigito(soma);
        if (digito1 != nums[12]) return false;

        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        soma = 0;
        for (int i = 0; i < 13; i++) {
            soma += nums[i] * pesos2[i];
        }
        int digito2 = calcularDigito(soma);
        return digito2 == nums[13];
    }

    private static int calcularDigito(int soma) {
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean todosDigitosIguais(String digitos) {
        return digitos.chars().distinct().count() == 1;
    }

    private static int[] paraInteiros(String digitos) {
        return digitos.chars().map(c -> c - '0').toArray();
    }
}
