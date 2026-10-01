package com.salao.modules.pedidocompra;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Chave composta do Pedido de Compra: (numero, serie, modelo, fornecedor) — sem ID artificial
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoCompraId implements Serializable {

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "serie", nullable = false)
    private Integer serie;

    @Column(name = "modelo", nullable = false)
    private Integer modelo;

    @Column(name = "fornecedor_id", nullable = false)
    private Long fornecedorId;
}
