package com.salao.modules.categoria;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;

    public List<Categoria> listar() {
        return repository.findAll();
    }

    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }

    public Categoria salvar(CategoriaDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Categoria já cadastrada");
        return repository.save(Categoria.builder().nome(dto.nome()).build());
    }

    public Categoria atualizar(Long id, CategoriaDTO dto) {
        Categoria cat = buscarPorId(id);
        cat.setNome(dto.nome());
        cat.setAtivo(dto.ativo());
        return repository.save(cat);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}