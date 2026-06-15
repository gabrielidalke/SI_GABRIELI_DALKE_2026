package com.salao.modules.ncmsh;

import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NcmShService {

    private final NcmShRepository repository;
    private final ProdutoRepository produtoRepository;

    public List<NcmShResponseDTO> listar() {
        return repository.findAll().stream().map(NcmShResponseDTO::from).toList();
    }

    public NcmShResponseDTO buscarPorId(Long id) {
        return NcmShResponseDTO.from(buscarEntidade(id));
    }

    public NcmShResponseDTO criar(NcmShRequestDTO dto) {
        var ncm = NcmSh.builder()
                .codigo(dto.codigo())
                .descricao(dto.descricao())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return NcmShResponseDTO.from(repository.save(ncm));
    }

    public NcmShResponseDTO atualizar(Long id, NcmShRequestDTO dto) {
        var ncm = buscarEntidade(id);
        ncm.setCodigo(dto.codigo());
        ncm.setDescricao(dto.descricao());
        if (dto.ativo() != null) ncm.setAtivo(dto.ativo());
        return NcmShResponseDTO.from(repository.save(ncm));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (produtoRepository.existsByNcmShId(id)) {
            throw new RuntimeException("NCM/SH possui produtos vinculados e não pode ser excluído");
        }
        repository.deleteById(id);
    }

    private NcmSh buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("NCM/SH não encontrado"));
    }
}
