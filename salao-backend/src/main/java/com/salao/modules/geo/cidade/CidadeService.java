package com.salao.modules.geo.cidade;

import com.salao.modules.cliente.ClienteRepository;
import com.salao.modules.geo.estado.Estado;
import com.salao.modules.geo.estado.EstadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CidadeService {

    private final CidadeRepository repository;
    private final EstadoRepository estadoRepository;
    private final ClienteRepository clienteRepository;

    public List<CidadeResponseDTO> listar() {
        return repository.findAllByOrderByNomeAsc().stream()
                .map(CidadeResponseDTO::from)
                .toList();
    }

    public CidadeResponseDTO buscarPorId(Long id) {
        return CidadeResponseDTO.from(buscarEntidade(id));
    }

    public List<CidadeResponseDTO> listarPorEstado(Long estadoId) {
        return repository.findByEstadoIdOrderByNomeAsc(estadoId).stream()
                .map(CidadeResponseDTO::from)
                .toList();
    }

    public CidadeResponseDTO salvar(CidadeRequestDTO dto) {
        Cidade cidade = Cidade.builder()
                .nome(dto.nome())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        if (dto.estadoId() != null) {
            Estado estado = estadoRepository.findById(dto.estadoId())
                    .orElseThrow(() -> new RuntimeException("Estado não encontrado"));
            cidade.setEstado(estado);
        }
        return CidadeResponseDTO.from(repository.save(cidade));
    }

    public CidadeResponseDTO atualizar(Long id, CidadeRequestDTO dto) {
        Cidade cidade = buscarEntidade(id);
        cidade.setNome(dto.nome());
        if (dto.ativo() != null) cidade.setAtivo(dto.ativo());
        if (dto.estadoId() != null) {
            estadoRepository.findById(dto.estadoId()).ifPresent(cidade::setEstado);
        } else {
            cidade.setEstado(null);
        }
        return CidadeResponseDTO.from(repository.save(cidade));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (clienteRepository.existsByCidadeId(id))
            throw new RuntimeException("Não é possível excluir: a cidade possui clientes vinculados");
        repository.deleteById(id);
    }

    private Cidade buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cidade não encontrada"));
    }
}
