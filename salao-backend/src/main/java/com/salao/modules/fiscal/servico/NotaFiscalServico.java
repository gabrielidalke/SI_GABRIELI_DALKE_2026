package com.salao.modules.fiscal.servico;

import com.salao.modules.agendamento.Agendamento;
import com.salao.modules.cliente.Cliente;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "notas_fiscais_servico")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscalServico {

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

    @Column(name = "valor_total", precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(length = 500)
    private String observacao;

    @OneToOne
    @JoinColumn(name = "agendamento_id")
    private Agendamento agendamento;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
}
