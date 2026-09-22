package com.salao.modules.unidademedida;

import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UnidadeMedidaService {

    private final UnidadeMedidaRepository repository;
    private final ProdutoRepository produtoRepository;

    public List<UnidadeMedidaResponseDTO> listar() {
        return repository.findAll().stream().map(UnidadeMedidaResponseDTO::from).toList();
    }

    public UnidadeMedidaResponseDTO buscarPorId(Long id) {
        return UnidadeMedidaResponseDTO.from(buscarEntidade(id));
    }

    public UnidadeMedidaResponseDTO criar(UnidadeMedidaRequestDTO dto) {
        var unidade = UnidadeMedida.builder()
                .unidadeMedida(dto.unidadeMedida())
                .sigla(dto.sigla())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return UnidadeMedidaResponseDTO.from(repository.save(unidade));
    }

    public UnidadeMedidaResponseDTO atualizar(Long id, UnidadeMedidaRequestDTO dto) {
        var unidade = buscarEntidade(id);
        unidade.setUnidadeMedida(dto.unidadeMedida());
        unidade.setSigla(dto.sigla());
        if (dto.ativo() != null) unidade.setAtivo(dto.ativo());
        return UnidadeMedidaResponseDTO.from(repository.save(unidade));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (produtoRepository.existsByUnidadeMedidaId(id))
            throw new RuntimeException("Não é possível excluir: existem produtos vinculados a esta unidade de medida");
        repository.deleteById(id);
    }

    private UnidadeMedida buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade de medida não encontrada"));
    }
}
