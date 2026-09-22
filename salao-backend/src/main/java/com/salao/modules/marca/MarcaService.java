package com.salao.modules.marca;

import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcaService {

    private final MarcaRepository repository;
    private final ProdutoRepository produtoRepository;

    public List<MarcaResponseDTO> listar() {
        return repository.findAll().stream().map(MarcaResponseDTO::from).toList();
    }

    public MarcaResponseDTO buscarPorId(Long id) {
        return MarcaResponseDTO.from(buscarEntidade(id));
    }

    public MarcaResponseDTO criar(MarcaRequestDTO dto) {
        var marca = Marca.builder()
                .marca(dto.marca())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return MarcaResponseDTO.from(repository.save(marca));
    }

    public MarcaResponseDTO atualizar(Long id, MarcaRequestDTO dto) {
        var marca = buscarEntidade(id);
        marca.setMarca(dto.marca());
        if (dto.ativo() != null) marca.setAtivo(dto.ativo());
        return MarcaResponseDTO.from(repository.save(marca));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (produtoRepository.existsByMarcaId(id))
            throw new RuntimeException("Não é possível excluir: existem produtos vinculados a esta marca");
        repository.deleteById(id);
    }

    private Marca buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));
    }
}
