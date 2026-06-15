package com.salao.modules.pagamento;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, Long> {
    boolean existsByFormaPagamento(String formaPagamento);
}
