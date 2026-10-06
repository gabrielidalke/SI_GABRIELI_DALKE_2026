package com.salao.modules.transportadora;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TransportadoraRepository extends JpaRepository<Transportadora, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
    boolean existsByCpfCnpj(String cpfCnpj);
    boolean existsByCpfCnpjAndIdNot(String cpfCnpj, Long id);
}
