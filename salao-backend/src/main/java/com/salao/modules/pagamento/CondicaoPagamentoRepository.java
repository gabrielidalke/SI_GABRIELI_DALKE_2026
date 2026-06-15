package com.salao.modules.pagamento;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CondicaoPagamentoRepository extends JpaRepository<CondicaoPagamento, Long> {
    boolean existsByCondicao(String condicao);
}
