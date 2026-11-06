package com.salao.modules.cliente;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByCpfCnpj(String cpfCnpj);
    boolean existsByCpfCnpjAndIdNot(String cpfCnpj, Long id);
    boolean existsByCidadeId(Long cidadeId);
    List<Cliente> findByAtivoTrue();
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}