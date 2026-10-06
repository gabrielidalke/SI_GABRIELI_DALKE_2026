package com.salao.modules.financeiro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContasPagarRepository extends JpaRepository<ContasPagar, Long> {
    List<ContasPagar> findByFornecedorId(Long fornecedorId);
    List<ContasPagar> findBySituacao(String situacao);

    // Contas lançadas pela confirmação de uma Nota de Entrada, na ordem de vencimento
    @Query("""
            select c from ContasPagar c
            where c.notaNumero = :numero and c.notaSerie = :serie
              and c.notaModelo = :modelo and c.notaFornecedorId = :fornecedorId
            order by c.dataVencimento, c.id
            """)
    List<ContasPagar> findByNota(@Param("numero") Integer numero, @Param("serie") Integer serie,
                                 @Param("modelo") Integer modelo, @Param("fornecedorId") Long fornecedorId);
}
