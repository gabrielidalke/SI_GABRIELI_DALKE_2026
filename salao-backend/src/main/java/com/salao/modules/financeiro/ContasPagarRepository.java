package com.salao.modules.financeiro;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContasPagarRepository extends JpaRepository<ContasPagar, Long> {
    List<ContasPagar> findByFornecedorId(Long fornecedorId);
    List<ContasPagar> findBySituacao(String situacao);
}
