package com.salao.modules.fornecedor;

import com.salao.modules.financeiro.ContasPagarRepository;
import com.salao.modules.geo.cidade.CidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository repository;
    private final ContasPagarRepository contasPagarRepository;
    private final CidadeRepository cidadeRepository;

    public List<FornecedorResponseDTO> listar() {
        return repository.findAll().stream().map(FornecedorResponseDTO::from).toList();
    }

    public FornecedorResponseDTO buscarPorId(Long id) {
        return FornecedorResponseDTO.from(buscarEntidade(id));
    }

    public FornecedorResponseDTO criar(FornecedorRequestDTO dto) {
        var cidade = dto.cidadeId() != null
                ? cidadeRepository.findById(dto.cidadeId())
                        .orElseThrow(() -> new RuntimeException("Cidade não encontrada"))
                : null;

        var fornecedor = Fornecedor.builder()
                .fornecedor(dto.fornecedor())
                .cpfCnpj(dto.cpfCnpj())
                .endereco(dto.endereco())
                .bairro(dto.bairro())
                .cep(dto.cep())
                .fone(dto.fone())
                .inscricaoEstadual(dto.inscricaoEstadual())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .cidade(cidade)
                .build();

        return FornecedorResponseDTO.from(repository.save(fornecedor));
    }

    public FornecedorResponseDTO atualizar(Long id, FornecedorRequestDTO dto) {
        var fornecedor = buscarEntidade(id);
        var cidade = dto.cidadeId() != null
                ? cidadeRepository.findById(dto.cidadeId())
                        .orElseThrow(() -> new RuntimeException("Cidade não encontrada"))
                : null;

        fornecedor.setFornecedor(dto.fornecedor());
        fornecedor.setCpfCnpj(dto.cpfCnpj());
        fornecedor.setEndereco(dto.endereco());
        fornecedor.setBairro(dto.bairro());
        fornecedor.setCep(dto.cep());
        fornecedor.setFone(dto.fone());
        fornecedor.setInscricaoEstadual(dto.inscricaoEstadual());
        if (dto.ativo() != null) fornecedor.setAtivo(dto.ativo());
        fornecedor.setCidade(cidade);

        return FornecedorResponseDTO.from(repository.save(fornecedor));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (!contasPagarRepository.findByFornecedorId(id).isEmpty()) {
            throw new RuntimeException("Fornecedor possui contas a pagar vinculadas e não pode ser excluído");
        }
        repository.deleteById(id);
    }

    private Fornecedor buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
    }
}
