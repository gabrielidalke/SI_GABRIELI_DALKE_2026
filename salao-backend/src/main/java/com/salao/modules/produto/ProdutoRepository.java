package com.salao.modules.produto;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    List<Produto> findByAtivoTrue();
}