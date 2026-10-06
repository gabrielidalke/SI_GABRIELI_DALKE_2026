package com.salao.modules.notaentrada;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NotaEntradaRepository extends JpaRepository<NotaEntrada, NotaEntradaId> {

    List<NotaEntrada> findAllByOrderByDataEmissaoDesc();

    // SELECT ... FOR UPDATE: trava a nota enquanto ela é editada, confirmada ou excluída
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select n from NotaEntrada n where n.id = :id")
    Optional<NotaEntrada> buscarParaAtualizar(@Param("id") NotaEntradaId id);

    @Query("""
            select case when count(n) > 0 then true else false end from NotaEntrada n
            where n.pedidoNumero = :numero and n.pedidoSerie = :serie
              and n.pedidoModelo = :modelo and n.id.fornecedorId = :fornecedorId
            """)
    boolean existePorPedido(@Param("numero") Integer numero, @Param("serie") Integer serie,
                            @Param("modelo") Integer modelo, @Param("fornecedorId") Long fornecedorId);

    // Emissão mais antiga entre as notas ligadas ao pedido (null se não houver nenhuma)
    @Query("""
            select min(n.dataEmissao) from NotaEntrada n
            where n.pedidoNumero = :numero and n.pedidoSerie = :serie
              and n.pedidoModelo = :modelo and n.id.fornecedorId = :fornecedorId
            """)
    LocalDate menorEmissaoPorPedido(@Param("numero") Integer numero, @Param("serie") Integer serie,
                                    @Param("modelo") Integer modelo, @Param("fornecedorId") Long fornecedorId);

    boolean existsByTransportadoraId(Long transportadoraId);

    boolean existsByIdFornecedorId(Long fornecedorId);
}
