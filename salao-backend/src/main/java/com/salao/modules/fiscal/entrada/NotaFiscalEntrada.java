package com.salao.modules.fiscal.entrada;

import com.salao.modules.compra.Compra;
import com.salao.modules.fornecedor.Fornecedor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_fiscais_entrada")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscalEntrada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_nota", length = 20)
    private String numeroNota;

    @Column(length = 5)
    private String serie;

    @CreationTimestamp
    @Column(name = "data_emissao", updatable = false)
    private LocalDateTime dataEmissao;

    @Column(name = "chave_acesso", length = 50)
    private String chaveAcesso;

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "transportadora_nome", length = 150)
    private String transportadoraNome;

    @Column(name = "veiculo_placa", length = 10)
    private String veiculoPlaca;

    @Column(length = 500)
    private String observacao;

    @OneToOne
    @JoinColumn(name = "compra_id")
    private Compra compra;

    @ManyToOne
    @JoinColumn(name = "fornecedor_id")
    private Fornecedor fornecedor;
}
