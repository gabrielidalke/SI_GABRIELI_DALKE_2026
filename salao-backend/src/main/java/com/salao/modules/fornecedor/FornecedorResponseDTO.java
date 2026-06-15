package com.salao.modules.fornecedor;

import java.time.LocalDateTime;

public record FornecedorResponseDTO(
        Long id,
        String fornecedor,
        String cpfCnpj,
        String endereco,
        String bairro,
        String cep,
        String fone,
        String inscricaoEstadual,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        CidadeInfo cidade
) {
    public record CidadeInfo(Long id, String nome) {}

    public static FornecedorResponseDTO from(Fornecedor f) {
        CidadeInfo cidade = f.getCidade() != null
                ? new CidadeInfo(f.getCidade().getId(), f.getCidade().getNome())
                : null;
        return new FornecedorResponseDTO(
                f.getId(), f.getFornecedor(), f.getCpfCnpj(),
                f.getEndereco(), f.getBairro(), f.getCep(),
                f.getFone(), f.getInscricaoEstadual(), f.getAtivo(),
                f.getCriadoEm(), f.getAtualizadoEm(), cidade
        );
    }
}
