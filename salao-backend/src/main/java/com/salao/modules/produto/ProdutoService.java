package com.salao.modules.produto;

import com.salao.modules.ncmsh.NcmShRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;
    private final NcmShRepository ncmShRepository;

    public List<ProdutoResponseDTO> listar() {
        return repository.findAll().stream().map(ProdutoResponseDTO::from).toList();
    }

    public ProdutoResponseDTO buscarPorId(Long id) {
        return ProdutoResponseDTO.from(buscarEntidade(id));
    }

    public ProdutoResponseDTO salvar(ProdutoDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Produto já cadastrado");
        var ncmSh = resolverNcmSh(dto.ncmShId());
        return ProdutoResponseDTO.from(repository.save(Produto.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .preco(dto.preco())
                .quantidade(dto.quantidade() != null ? dto.quantidade() : 0)
                .ncmSh(ncmSh)
                .build()));
    }

    public ProdutoResponseDTO atualizar(Long id, ProdutoDTO dto) {
        Produto p = buscarEntidade(id);
        p.setNome(dto.nome());
        p.setDescricao(dto.descricao());
        p.setPreco(dto.preco());
        p.setQuantidade(dto.quantidade());
        p.setAtivo(dto.ativo());
        p.setNcmSh(resolverNcmSh(dto.ncmShId()));
        return ProdutoResponseDTO.from(repository.save(p));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private Produto buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    private com.salao.modules.ncmsh.NcmSh resolverNcmSh(Long ncmShId) {
        if (ncmShId == null) return null;
        return ncmShRepository.findById(ncmShId)
                .orElseThrow(() -> new RuntimeException("NCM/SH não encontrado"));
    }
}
