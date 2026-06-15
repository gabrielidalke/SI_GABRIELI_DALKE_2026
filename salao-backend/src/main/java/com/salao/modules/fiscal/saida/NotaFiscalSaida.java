package com.salao.modules.fiscal.saida;

import com.salao.modules.cliente.Cliente;
import com.salao.modules.venda.Venda;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_fiscais_saida")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscalSaida {

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
    @JoinColumn(name = "venda_id")
    private Venda venda;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
