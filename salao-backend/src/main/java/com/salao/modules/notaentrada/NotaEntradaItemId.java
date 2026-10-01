package com.salao.modules.notaentrada;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Chave do item: chave da nota + produto (o mesmo produto não pode aparecer duas vezes na nota)
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaEntradaItemId implements Serializable {

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
