package com.salao.modules.funcao;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncaoRepository extends JpaRepository<Funcao, Long> {
    boolean existsByFuncaoIgnoreCase(String funcao);
    boolean existsByFuncaoIgnoreCaseAndIdNot(String funcao, Long id);
}
