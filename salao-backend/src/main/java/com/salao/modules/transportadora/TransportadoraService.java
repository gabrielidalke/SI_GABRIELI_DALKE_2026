package com.salao.modules.transportadora;

import com.salao.modules.notaentrada.NotaEntradaRepository;
import com.salao.modules.geo.cidade.Cidade;
import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.util.TipoPessoa;
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
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.JURIDICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (repository.existsByNomeIgnoreCase(dto.nome().trim()))
            throw new RuntimeException("Transportadora já cadastrada");
        if (documento != null && repository.existsByCpfCnpj(documento))
            throw new RuntimeException("Já existe uma transportadora cadastrada com este CPF/CNPJ.");

        var transportadora = new Transportadora();
        transportadora.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        preencher(transportadora, dto, tipo, documento);
        return TransportadoraResponseDTO.from(repository.save(transportadora));
    }

    public TransportadoraResponseDTO atualizar(Long id, TransportadoraRequestDTO dto) {
        var transportadora = buscarEntidade(id);
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.JURIDICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (repository.existsByNomeIgnoreCaseAndIdNot(dto.nome().trim(), id))
            throw new RuntimeException("Transportadora já cadastrada");
        if (documento != null && repository.existsByCpfCnpjAndIdNot(documento, id))
            throw new RuntimeException("Já existe uma transportadora cadastrada com este CPF/CNPJ.");

        if (dto.ativo() != null) transportadora.setAtivo(dto.ativo());
        preencher(transportadora, dto, tipo, documento);
        return TransportadoraResponseDTO.from(repository.save(transportadora));
    }

    private void preencher(Transportadora t, TransportadoraRequestDTO dto, String tipo, String documento) {
        t.setTipoPessoa(tipo);
        t.setNome(dto.nome().trim());
        t.setNomeFantasia(vazioParaNulo(dto.nomeFantasia()));
        t.setCpfCnpj(documento);
        // RG para pessoa física; inscrições (estadual e do substituto tributário) para jurídica
        t.setRg(TipoPessoa.soSeFisica(tipo, dto.rg()));
        t.setInscricaoEstadual(TipoPessoa.soSeJuridica(tipo, dto.inscricaoEstadual()));
        t.setInscEstSubstTrib(TipoPessoa.soSeJuridica(tipo, dto.inscEstSubstTrib()));
        t.setFone(vazioParaNulo(dto.fone()));
        t.setEmail(vazioParaNulo(dto.email()));
        t.setSite(vazioParaNulo(dto.site()));
        t.setEndereco(vazioParaNulo(dto.endereco()));
        t.setNumero(vazioParaNulo(dto.numero()));
        t.setComplemento(vazioParaNulo(dto.complemento()));
        t.setBairro(vazioParaNulo(dto.bairro()));
        t.setCep(vazioParaNulo(dto.cep()));
        t.setCidade(resolveCidade(dto.cidadeId()));
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
