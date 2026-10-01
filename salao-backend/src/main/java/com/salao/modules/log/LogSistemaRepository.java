package com.salao.modules.log;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogSistemaRepository extends JpaRepository<LogSistema, Long> {
    List<LogSistema> findTop200ByOrderByCriadoEmDescIdDesc();
}
