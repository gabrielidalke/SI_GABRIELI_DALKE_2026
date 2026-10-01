package com.salao.modules.pedidocompra;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PedidoCompraItemRepository extends JpaRepository<PedidoCompraItem, PedidoCompraItemId> {

    @Query("""
            select i from PedidoCompraItem i
            where i.id.numero = :numero and i.id.serie = :serie
              and i.id.modelo = :modelo and i.id.fornecedorId = :fornecedorId
            order by i.id.produtoId
            """)
    List<PedidoCompraItem> findByPedido(@Param("numero") Integer numero, @Param("serie") Integer serie,
                                        @Param("modelo") Integer modelo, @Param("fornecedorId") Long fornecedorId);
}
