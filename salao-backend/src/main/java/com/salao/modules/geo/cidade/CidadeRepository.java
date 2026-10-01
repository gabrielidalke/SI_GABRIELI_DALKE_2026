package com.salao.modules.geo.cidade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CidadeRepository extends JpaRepository<Cidade, Long> {
    List<Cidade> findAllByOrderByNomeAsc();
    List<Cidade> findByEstadoIdOrderByNomeAsc(Long estadoId);
    boolean existsByEstadoId(Long estadoId);
    boolean existsByNomeIgnoreCaseAndEstadoId(String nome, Long estadoId);
    boolean existsByNomeIgnoreCaseAndEstadoIdAndIdNot(String nome, Long estadoId, Long id);
}
