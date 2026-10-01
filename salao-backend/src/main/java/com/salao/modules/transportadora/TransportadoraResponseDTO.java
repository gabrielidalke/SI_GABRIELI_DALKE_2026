package com.salao.modules.transportadora;

import java.time.LocalDateTime;

public record TransportadoraResponseDTO(
        Long id,
        String nome,
        String cpfCnpj,
        String fone,
        String endereco,
        String bairro,
        String cep,
        Boolean ativo,
        LocalDateTime criadoEm,
        CidadeInfo cidade
) {
    public record CidadeInfo(Long id, String nome) {}

    public static TransportadoraResponseDTO from(Transportadora t) {
        CidadeInfo cidade = t.getCidade() != null
                ? new CidadeInfo(t.getCidade().getId(), t.getCidade().getNome())
                : null;
        return new TransportadoraResponseDTO(
                t.getId(), t.getNome(), t.getCpfCnpj(), t.getFone(),
                t.getEndereco(), t.getBairro(), t.getCep(), t.getAtivo(),
                t.getCriadoEm(), cidade
        );
    }
}
