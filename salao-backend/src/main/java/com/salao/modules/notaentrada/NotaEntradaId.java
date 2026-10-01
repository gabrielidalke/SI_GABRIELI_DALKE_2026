package com.salao.modules.notaentrada;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

// Chave composta da Nota de Entrada: (numero, serie, modelo, fornecedor).
// Não existe ID artificial: para localizar, editar, confirmar ou excluir são necessários os quatro campos.
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaEntradaId implements Serializable {

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "serie", nullable = false)
    private Integer serie;

    @Column(name = "modelo", nullable = false)
    private Integer modelo;

    @Column(name = "fornecedor_id", nullable = false)
    private Long fornecedorId;
}
