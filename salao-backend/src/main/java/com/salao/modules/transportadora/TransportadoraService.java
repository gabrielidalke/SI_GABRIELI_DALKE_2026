package com.salao.modules.transportadora;

import com.salao.modules.notaentrada.NotaEntradaRepository;
import com.salao.modules.geo.cidade.Cidade;
import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.util.CpfCnpjValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportadoraService {

    private final TransportadoraRepository repository;
    private final CidadeRepository cidadeRepository;
    private final NotaEntradaRepository notaEntradaRepository;

    public List<TransportadoraResponseDTO> listar() {
        return repository.findAll().stream().map(TransportadoraResponseDTO::from).toList();
    }

    public TransportadoraResponseDTO buscarPorId(Long id) {
        return TransportadoraResponseDTO.from(buscarEntidade(id));
    }

    public TransportadoraResponseDTO criar(TransportadoraRequestDTO dto) {
        validarCpfCnpj(dto.cpfCnpj());
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Transportadora já cadastrada");

        var transportadora = Transportadora.builder()
                .nome(dto.nome())
                .cpfCnpj(dto.cpfCnpj())
                .fone(dto.fone())
                .endereco(dto.endereco())
                .bairro(dto.bairro())
                .cep(dto.cep())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .cidade(resolveCidade(dto.cidadeId()))
                .build();

        return TransportadoraResponseDTO.from(repository.save(transportadora));
    }

    public TransportadoraResponseDTO atualizar(Long id, TransportadoraRequestDTO dto) {
        validarCpfCnpj(dto.cpfCnpj());
        var transportadora = buscarEntidade(id);
        if (repository.existsByNomeIgnoreCaseAndIdNot(dto.nome(), id))
            throw new RuntimeException("Transportadora já cadastrada");

        transportadora.setNome(dto.nome());
        transportadora.setCpfCnpj(dto.cpfCnpj());
        transportadora.setFone(dto.fone());
        transportadora.setEndereco(dto.endereco());
        transportadora.setBairro(dto.bairro());
        transportadora.setCep(dto.cep());
        if (dto.ativo() != null) transportadora.setAtivo(dto.ativo());
        transportadora.setCidade(resolveCidade(dto.cidadeId()));

        return TransportadoraResponseDTO.from(repository.save(transportadora));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (notaEntradaRepository.existsByTransportadoraId(id))
            throw new RuntimeException("Transportadora possui notas de entrada vinculadas e não pode ser excluída");
        repository.deleteById(id);
    }

    private void validarCpfCnpj(String cpfCnpj) {
        if (cpfCnpj == null || cpfCnpj.isBlank()) return;
        String digitos = cpfCnpj.replaceAll("\\D", "");
        if (digitos.length() == 11) {
            if (!CpfCnpjValidator.validarCPF(cpfCnpj))
                throw new RuntimeException("CPF inválido.");
        } else {
            if (!CpfCnpjValidator.validarCNPJ(cpfCnpj))
                throw new RuntimeException("CNPJ inválido.");
        }
    }

    private Cidade resolveCidade(Long id) {
        if (id == null) return null;
        return cidadeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cidade não encontrada"));
    }

    private Transportadora buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transportadora não encontrada"));
    }
}
