package com.salao.modules.funcionario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    boolean existsByCpfCnpj(String cpfCnpj);
    boolean existsByCpfCnpjAndIdNot(String cpfCnpj, Long id);
    boolean existsByFuncaoId(Long funcaoId);
    List<Funcionario> findByAtivoTrue();
}
