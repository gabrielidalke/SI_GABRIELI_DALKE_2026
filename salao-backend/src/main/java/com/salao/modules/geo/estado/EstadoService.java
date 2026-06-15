package com.salao.modules.geo.estado;

import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.modules.geo.pais.Pais;
import com.salao.modules.geo.pais.PaisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EstadoService {

    private final EstadoRepository repository;
    private final PaisRepository paisRepository;
    private final CidadeRepository cidadeRepository;

    public List<EstadoResponseDTO> listar() {
        return repository.findAllByOrderByNomeAsc().stream()
                .map(EstadoResponseDTO::from)
                .toList();
    }

    public EstadoResponseDTO buscarPorId(Long id) {
        return EstadoResponseDTO.from(buscarEntidade(id));
    }

    public List<EstadoResponseDTO> listarPorPais(Long paisId) {
        return repository.findByPaisIdOrderByNomeAsc(paisId).stream()
                .map(EstadoResponseDTO::from)
                .toList();
    }

    public EstadoResponseDTO salvar(EstadoRequestDTO dto) {
        String uf = dto.uf().toUpperCase();
        if (repository.existsByUf(uf))
            throw new RuntimeException("UF já cadastrada para outro estado");
        Estado estado = Estado.builder()
                .nome(dto.nome())
                .uf(uf)
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        if (dto.paisId() != null) {
            Pais pais = paisRepository.findById(dto.paisId())
                    .orElseThrow(() -> new RuntimeException("País não encontrado"));
            estado.setPais(pais);
        }
        return EstadoResponseDTO.from(repository.save(estado));
    }

    public EstadoResponseDTO atualizar(Long id, EstadoRequestDTO dto) {
        Estado estado = buscarEntidade(id);
        String uf = dto.uf().toUpperCase();
        if (repository.existsByUfAndIdNot(uf, id))
            throw new RuntimeException("UF já cadastrada para outro estado");
        estado.setNome(dto.nome());
        estado.setUf(uf);
        if (dto.ativo() != null) estado.setAtivo(dto.ativo());
        if (dto.paisId() != null) {
            paisRepository.findById(dto.paisId()).ifPresent(estado::setPais);
        } else {
            estado.setPais(null);
        }
        return EstadoResponseDTO.from(repository.save(estado));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (cidadeRepository.existsByEstadoId(id))
            throw new RuntimeException("Não é possível excluir: o estado possui cidades vinculadas");
        repository.deleteById(id);
    }

    private Estado buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Estado não encontrado"));
    }
}
