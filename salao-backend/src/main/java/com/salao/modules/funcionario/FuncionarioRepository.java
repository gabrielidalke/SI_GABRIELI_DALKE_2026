package com.salao.modules.funcionario;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    boolean existsByCpf(String cpf);
    List<Funcionario> findByAtivoTrue();
}