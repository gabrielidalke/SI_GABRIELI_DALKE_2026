package com.salao.modules.cliente;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByCpf(String cpf);
    List<Cliente> findByAtivoTrue();
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
}