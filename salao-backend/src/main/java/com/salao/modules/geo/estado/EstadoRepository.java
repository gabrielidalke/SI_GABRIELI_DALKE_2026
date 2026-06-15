package com.salao.modules.geo.estado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstadoRepository extends JpaRepository<Estado, Long> {
    List<Estado> findAllByOrderByNomeAsc();
    List<Estado> findByPaisIdOrderByNomeAsc(Long paisId);
    boolean existsByUf(String uf);
    boolean existsByUfAndIdNot(String uf, Long id);
    boolean existsByPaisId(Long paisId);
}
