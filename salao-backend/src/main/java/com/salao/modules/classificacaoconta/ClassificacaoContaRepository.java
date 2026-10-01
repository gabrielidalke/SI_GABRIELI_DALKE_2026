package com.salao.modules.classificacaoconta;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassificacaoContaRepository extends JpaRepository<ClassificacaoConta, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    List<ClassificacaoConta> findByAtivoTrue();
}
