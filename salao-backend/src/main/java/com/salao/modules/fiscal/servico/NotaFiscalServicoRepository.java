package com.salao.modules.fiscal.servico;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotaFiscalServicoRepository extends JpaRepository<NotaFiscalServico, Long> {
    boolean existsByAgendamentoId(Long agendamentoId);
}
