package com.salao.modules.funcao;

import com.salao.modules.funcionario.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncaoService {

    private final FuncaoRepository repository;
    private final FuncionarioRepository funcionarioRepository;

    public List<FuncaoResponseDTO> listar() {
        return repository.findAll().stream().map(FuncaoResponseDTO::from).toList();
    }

    public FuncaoResponseDTO buscarPorId(Long id) {
        return FuncaoResponseDTO.from(buscarEntidade(id));
    }

    public FuncaoResponseDTO criar(FuncaoRequestDTO dto) {
        String nome = dto.funcao().trim();
        if (repository.existsByFuncaoIgnoreCase(nome))
            throw new RuntimeException("Função já cadastrada");
        var funcao = Funcao.builder()
                .funcao(nome)
                .salarioBase(dto.salarioBase())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return FuncaoResponseDTO.from(repository.save(funcao));
    }

    public FuncaoResponseDTO atualizar(Long id, FuncaoRequestDTO dto) {
        var funcao = buscarEntidade(id);
        String nome = dto.funcao().trim();
        if (repository.existsByFuncaoIgnoreCaseAndIdNot(nome, id))
            throw new RuntimeException("Função já cadastrada");
        funcao.setFuncao(nome);
        funcao.setSalarioBase(dto.salarioBase());
        if (dto.ativo() != null) funcao.setAtivo(dto.ativo());
        return FuncaoResponseDTO.from(repository.save(funcao));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (funcionarioRepository.existsByFuncaoId(id))
            throw new RuntimeException("Não é possível excluir: existem funcionários com esta função");
        repository.deleteById(id);
    }

    public Funcao buscarAtiva(Long id) {
        var funcao = buscarEntidade(id);
        if (Boolean.FALSE.equals(funcao.getAtivo()))
            throw new RuntimeException("Função inativa: " + funcao.getFuncao());
        return funcao;
    }

    private Funcao buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Função não encontrada"));
    }
}
