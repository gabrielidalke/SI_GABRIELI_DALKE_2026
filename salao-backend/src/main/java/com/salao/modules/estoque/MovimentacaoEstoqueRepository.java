package com.salao.modules.estoque;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findByProdutoIdOrderByCriadoEmDesc(Long produtoId);
    List<MovimentacaoEstoque> findAllByOrderByCriadoEmDesc();
}
