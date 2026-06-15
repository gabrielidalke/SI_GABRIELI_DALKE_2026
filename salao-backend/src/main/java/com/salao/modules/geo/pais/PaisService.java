package com.salao.modules.geo.pais;

import com.salao.modules.geo.estado.EstadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaisService {

    private final PaisRepository repository;
    private final EstadoRepository estadoRepository;

    public List<PaisResponseDTO> listar() {
        return repository.findAllByOrderByNomeAsc().stream()
                .map(PaisResponseDTO::from)
                .toList();
    }

    public PaisResponseDTO buscarPorId(Long id) {
        return PaisResponseDTO.from(buscarEntidade(id));
    }

    public PaisResponseDTO salvar(PaisRequestDTO dto) {
        String sigla = dto.sigla().toUpperCase();
        if (repository.existsBySigla(sigla))
            throw new RuntimeException("Sigla já cadastrada para outro país");
        Pais pais = Pais.builder()
                .nome(dto.nome())
                .sigla(sigla)
                .nacionalidade(dto.nacionalidade())
                .moeda(dto.moeda())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return PaisResponseDTO.from(repository.save(pais));
    }

    public PaisResponseDTO atualizar(Long id, PaisRequestDTO dto) {
        Pais pais = buscarEntidade(id);
        String sigla = dto.sigla().toUpperCase();
        if (repository.existsBySiglaAndIdNot(sigla, id))
            throw new RuntimeException("Sigla já cadastrada para outro país");
        pais.setNome(dto.nome());
        pais.setSigla(sigla);
        pais.setNacionalidade(dto.nacionalidade());
        pais.setMoeda(dto.moeda());
        if (dto.ativo() != null) pais.setAtivo(dto.ativo());
        return PaisResponseDTO.from(repository.save(pais));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (estadoRepository.existsByPaisId(id))
            throw new RuntimeException("Não é possível excluir: o país possui estados vinculados");
        repository.deleteById(id);
    }

    private Pais buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("País não encontrado"));
    }
}
