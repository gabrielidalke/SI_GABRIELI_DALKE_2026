package com.salao.modules.financeiro;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContasReceberRepository extends JpaRepository<ContasReceber, Long> {
    List<ContasReceber> findByClienteId(Long clienteId);
    List<ContasReceber> findBySituacao(String situacao);
}
