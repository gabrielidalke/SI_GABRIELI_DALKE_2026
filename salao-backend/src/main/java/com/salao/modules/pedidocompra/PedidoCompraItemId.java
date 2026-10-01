package com.salao.modules.pedidocompra;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCompraItemId implements Serializable {

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "serie", nullable = false)
    private Integer serie;

    @Column(name = "modelo", nullable = false)
    private Integer modelo;

    @Column(name = "fornecedor_id", nullable = false)
    private Long fornecedorId;

    @Column(name = "produto_id", nullable = false)
    private Long produtoId;
}
