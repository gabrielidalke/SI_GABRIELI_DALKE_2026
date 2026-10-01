package com.salao.modules.classificacaoconta;

import com.salao.modules.notaentrada.NotaEntradaItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassificacaoContaService {

    private final ClassificacaoContaRepository repository;
    private final NotaEntradaItemRepository notaEntradaItemRepository;

    public List<ClassificacaoConta> listar() {
        return repository.findAll();
    }

    public ClassificacaoConta buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classificação da conta não encontrada"));
    }

    public ClassificacaoConta salvar(ClassificacaoContaDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Classificação da conta já cadastrada");
        return repository.save(ClassificacaoConta.builder().nome(dto.nome()).build());
    }

    public ClassificacaoConta atualizar(Long id, ClassificacaoContaDTO dto) {
        ClassificacaoConta classificacao = buscarPorId(id);
        if (!classificacao.getNome().equalsIgnoreCase(dto.nome()) && repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Classificação da conta já cadastrada");
        classificacao.setNome(dto.nome());
        if (dto.ativo() != null) classificacao.setAtivo(dto.ativo());
        return repository.save(classificacao);
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (notaEntradaItemRepository.existsByClassificacaoContaId(id))
            throw new RuntimeException("Não é possível excluir: existem itens de notas de entrada vinculados a esta classificação");
        repository.deleteById(id);
    }
}
