package com.salao.modules.pagamento;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ParcelaRepository extends JpaRepository<Parcela, Long> {
    boolean existsByFormaPagamentoId(Long id);
    boolean existsByCondicaoPagamentoId(Long id);
}
