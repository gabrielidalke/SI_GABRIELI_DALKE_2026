package com.salao.modules.fiscal.servico;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record NotaFiscalServicoResponseDTO(
        Long id,
        String numeroNota,
        String serie,
        LocalDateTime dataEmissao,
        BigDecimal valorTotal,
        String observacao,
        AgendamentoInfo agendamento,
        ClienteInfo cliente
) {
    public record AgendamentoInfo(Long id, LocalDateTime dataHora, List<ServicoInfo> servicos) {}
    public record ServicoInfo(Long id, String nome) {}
    public record ClienteInfo(Long id, String nome) {}

    public static NotaFiscalServicoResponseDTO from(NotaFiscalServico n) {
        AgendamentoInfo agendamento = null;
        if (n.getAgendamento() != null) {
            var a = n.getAgendamento();
            List<ServicoInfo> servicos = a.getServicos() != null
                    ? a.getServicos().stream().map(s -> new ServicoInfo(s.getId(), s.getNome())).toList()
                    : List.of();
            agendamento = new AgendamentoInfo(a.getId(), a.getDataHora(), servicos);
        }
        ClienteInfo cliente = n.getCliente() != null
                ? new ClienteInfo(n.getCliente().getId(), n.getCliente().getNome())
                : null;
        return new NotaFiscalServicoResponseDTO(
                n.getId(), n.getNumeroNota(), n.getSerie(), n.getDataEmissao(),
                n.getValorTotal(), n.getObservacao(), agendamento, cliente
        );
    }
}
