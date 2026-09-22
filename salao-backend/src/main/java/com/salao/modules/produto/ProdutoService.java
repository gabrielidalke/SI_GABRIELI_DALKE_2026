package com.salao.modules.produto;

import com.salao.modules.categoria.Categoria;
import com.salao.modules.categoria.CategoriaRepository;
import com.salao.modules.marca.Marca;
import com.salao.modules.marca.MarcaRepository;
import com.salao.modules.ncmsh.NcmSh;
import com.salao.modules.ncmsh.NcmShRepository;
import com.salao.modules.unidademedida.UnidadeMedida;
import com.salao.modules.unidademedida.UnidadeMedidaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;
    private final NcmShRepository ncmShRepository;
    private final MarcaRepository marcaRepository;
    private final UnidadeMedidaRepository unidadeMedidaRepository;
    private final CategoriaRepository categoriaRepository;

    public List<ProdutoResponseDTO> listar() {
        return repository.findAll().stream().map(ProdutoResponseDTO::from).toList();
    }

    public ProdutoResponseDTO buscarPorId(Long id) {
        return ProdutoResponseDTO.from(buscarEntidade(id));
    }

    public ProdutoResponseDTO salvar(ProdutoDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Produto já cadastrado");
        return ProdutoResponseDTO.from(repository.save(Produto.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .precoVenda(dto.precoVenda())
                .precoCusto(dto.precoCusto())
                .desconto(dto.desconto() != null ? dto.desconto() : BigDecimal.ZERO)
                .quantidade(dto.quantidade() != null ? dto.quantidade() : 0)
                .ncmSh(resolverNcmSh(dto.ncmShId()))
                .marca(resolverMarca(dto.marcaId()))
                .unidadeMedida(resolverUnidadeMedida(dto.unidadeMedidaId()))
                .categoria(resolverCategoria(dto.categoriaId()))
                .build()));
    }

    public ProdutoResponseDTO atualizar(Long id, ProdutoDTO dto) {
        Produto p = buscarEntidade(id);
        p.setNome(dto.nome());
        p.setDescricao(dto.descricao());
        p.setPrecoVenda(dto.precoVenda());
        p.setPrecoCusto(dto.precoCusto());
        if (dto.desconto() != null) p.setDesconto(dto.desconto());
        p.setQuantidade(dto.quantidade());
        p.setAtivo(dto.ativo());
        p.setNcmSh(resolverNcmSh(dto.ncmShId()));
        p.setMarca(resolverMarca(dto.marcaId()));
        p.setUnidadeMedida(resolverUnidadeMedida(dto.unidadeMedidaId()));
        p.setCategoria(resolverCategoria(dto.categoriaId()));
        return ProdutoResponseDTO.from(repository.save(p));
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private Produto buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    private NcmSh resolverNcmSh(Long ncmShId) {
        if (ncmShId == null) return null;
        return ncmShRepository.findById(ncmShId)
                .orElseThrow(() -> new RuntimeException("NCM/SH não encontrado"));
    }

    private Marca resolverMarca(Long marcaId) {
        if (marcaId == null) return null;
        return marcaRepository.findById(marcaId)
                .orElseThrow(() -> new RuntimeException("Marca não encontrada"));
    }

    private UnidadeMedida resolverUnidadeMedida(Long unidadeMedidaId) {
        if (unidadeMedidaId == null) return null;
        return unidadeMedidaRepository.findById(unidadeMedidaId)
                .orElseThrow(() -> new RuntimeException("Unidade de medida não encontrada"));
    }

    private Categoria resolverCategoria(Long categoriaId) {
        if (categoriaId == null) return null;
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));
    }
}
