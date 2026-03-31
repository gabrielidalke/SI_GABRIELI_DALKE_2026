package com.salao.modules.produto;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;

    public List<Produto> listar() {
        return repository.findAll();
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public Produto salvar(ProdutoDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Produto já cadastrado");
        return repository.save(Produto.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .preco(dto.preco())
                .quantidade(dto.quantidade() != null ? dto.quantidade() : 0)
                .build());
    }

    public Produto atualizar(Long id, ProdutoDTO dto) {
        Produto p = buscarPorId(id);
        p.setNome(dto.nome());
        p.setDescricao(dto.descricao());
        p.setPreco(dto.preco());
        p.setQuantidade(dto.quantidade());
        p.setAtivo(dto.ativo());
        return repository.save(p);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}