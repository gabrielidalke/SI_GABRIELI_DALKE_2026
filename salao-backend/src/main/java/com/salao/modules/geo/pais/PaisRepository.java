package com.salao.modules.geo.pais;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaisRepository extends JpaRepository<Pais, Long> {
    List<Pais> findAllByOrderByNomeAsc();
    boolean existsBySigla(String sigla);
    boolean existsBySiglaAndIdNot(String sigla, Long id);
}
