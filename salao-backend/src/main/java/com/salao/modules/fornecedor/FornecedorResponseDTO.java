package com.salao.modules.fornecedor;

import java.time.LocalDateTime;

public record FornecedorResponseDTO(
        Long id,
        String tipoPessoa,
        String fornecedor,
        String nomeFantasia,
        String cpfCnpj,
        String rg,
        String inscricaoEstadual,
        String inscEstSubstTrib,
        String inscricaoMunicipal,
        String endereco,
        String numero,
        String complemento,
        String bairro,
        String cep,
        String fone,
        String celular,
        String email,
        String contato,
        String site,
        String observacao,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        CidadeInfo cidade,
        CondicaoPagamentoInfo condicaoPagamento
) {
    public record CidadeInfo(Long id, String nome) {}
    public record CondicaoPagamentoInfo(Long id, String condicao) {}

    public static FornecedorResponseDTO from(Fornecedor f) {
        CidadeInfo cidade = f.getCidade() != null
                ? new CidadeInfo(f.getCidade().getId(), f.getCidade().getNome())
                : null;
        CondicaoPagamentoInfo cp = f.getCondicaoPagamento() != null
                ? new CondicaoPagamentoInfo(f.getCondicaoPagamento().getId(), f.getCondicaoPagamento().getCondicao())
                : null;
        return new FornecedorResponseDTO(
                f.getId(), f.getTipoPessoa(), f.getFornecedor(), f.getNomeFantasia(), f.getCpfCnpj(),
                f.getRg(), f.getInscricaoEstadual(), f.getInscEstSubstTrib(), f.getInscricaoMunicipal(),
                f.getEndereco(), f.getNumero(), f.getComplemento(), f.getBairro(), f.getCep(),
                f.getFone(), f.getCelular(), f.getEmail(), f.getContato(), f.getSite(), f.getObservacao(),
                f.getAtivo(), f.getCriadoEm(), f.getAtualizadoEm(), cidade, cp
        );
    }
}
