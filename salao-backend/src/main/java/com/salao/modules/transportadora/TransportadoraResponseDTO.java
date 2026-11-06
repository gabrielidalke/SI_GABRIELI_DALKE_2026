package com.salao.modules.transportadora;

import java.time.LocalDateTime;

public record TransportadoraResponseDTO(
        Long id,
        String tipoPessoa,
        String nome,
        String nomeFantasia,
        String cpfCnpj,
        String rg,
        String inscricaoEstadual,
        String inscEstSubstTrib,
        String fone,
        String email,
        String site,
        String endereco,
        String numero,
        String complemento,
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
                t.getId(), t.getTipoPessoa(), t.getNome(), t.getNomeFantasia(), t.getCpfCnpj(),
                t.getRg(), t.getInscricaoEstadual(), t.getInscEstSubstTrib(),
                t.getFone(), t.getEmail(), t.getSite(),
                t.getEndereco(), t.getNumero(), t.getComplemento(), t.getBairro(), t.getCep(), t.getAtivo(),
                t.getCriadoEm(), cidade
        );
    }
}
