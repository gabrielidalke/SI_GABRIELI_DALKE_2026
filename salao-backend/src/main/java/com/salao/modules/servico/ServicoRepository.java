package com.salao.modules.servico;



import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServicoRepository extends JpaRepository<Servico, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    List<Servico> findByAtivoTrue();
}