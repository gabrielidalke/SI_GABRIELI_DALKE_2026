package com.salao.modules.log;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogSistemaService {

    private final LogSistemaRepository repository;

    // Roda na mesma transação de quem chama: se a operação falhar, o log também é desfeito
    public void registrar(String entidade, String acao, String descricao) {
        repository.save(LogSistema.builder().entidade(entidade).acao(acao).descricao(descricao).build());
    }

    public List<LogSistema> recentes() {
        return repository.findTop200ByOrderByCriadoEmDescIdDesc();
    }
}
