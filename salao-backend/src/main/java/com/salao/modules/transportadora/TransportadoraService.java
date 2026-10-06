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
        String documento = CpfCnpjValidator.formatar(dto.cpfCnpj());
        if (repository.existsByNomeIgnoreCase(dto.nome().trim()))
            throw new RuntimeException("Transportadora já cadastrada");
        if (documento != null && repository.existsByCpfCnpj(documento))
            throw new RuntimeException("Já existe uma transportadora cadastrada com este CPF/CNPJ.");

        var transportadora = Transportadora.builder()
                .nome(dto.nome().trim())
                .cpfCnpj(documento)
                .fone(dto.fone())
                .endereco(vazioParaNulo(dto.endereco()))
                .bairro(vazioParaNulo(dto.bairro()))
                .cep(dto.cep())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .cidade(resolveCidade(dto.cidadeId()))
                .build();

        return TransportadoraResponseDTO.from(repository.save(transportadora));
    }

    public TransportadoraResponseDTO atualizar(Long id, TransportadoraRequestDTO dto) {
        validarCpfCnpj(dto.cpfCnpj());
        var transportadora = buscarEntidade(id);
        String documento = CpfCnpjValidator.formatar(dto.cpfCnpj());
        if (repository.existsByNomeIgnoreCaseAndIdNot(dto.nome().trim(), id))
            throw new RuntimeException("Transportadora já cadastrada");
        if (documento != null && repository.existsByCpfCnpjAndIdNot(documento, id))
            throw new RuntimeException("Já existe uma transportadora cadastrada com este CPF/CNPJ.");

        transportadora.setNome(dto.nome().trim());
        transportadora.setCpfCnpj(documento);
        transportadora.setFone(dto.fone());
        transportadora.setEndereco(vazioParaNulo(dto.endereco()));
        transportadora.setBairro(vazioParaNulo(dto.bairro()));
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

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
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
