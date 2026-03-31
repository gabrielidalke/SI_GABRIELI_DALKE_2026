package com.salao.modules.servico;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository repository;

    public List<Servico> listar() {
        return repository.findAll();
    }

    public Servico buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Serviço não encontrado"));
    }

    public Servico salvar(ServicoDTO dto) {
        if (repository.existsByNomeIgnoreCase(dto.nome()))
            throw new RuntimeException("Serviço já cadastrado");
        return repository.save(Servico.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .duracaoMin(dto.duracaoMin())
                .preco(dto.preco())
                .build());
    }

    public Servico atualizar(Long id, ServicoDTO dto) {
        Servico s = buscarPorId(id);
        s.setNome(dto.nome());
        s.setDescricao(dto.descricao());
        s.setDuracaoMin(dto.duracaoMin());
        s.setPreco(dto.preco());
        s.setAtivo(dto.ativo());
        return repository.save(s);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}