package com.salao.modules.agendamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AgendamentoResponseDTO(
        Long id,
        LocalDateTime dataHora,
        String observacao,
        String status,
        BigDecimal valorTotal,
        LocalDateTime criadoEm,
        boolean nfseGerada,
        ClienteInfo cliente,
        FuncionarioInfo funcionario,
        List<ServicoInfo> servicos
) {
    public record ClienteInfo(Long id, String nome, String telefone) {}
    public record FuncionarioInfo(Long id, String nome) {}
    public record ServicoInfo(Long id, String nome, BigDecimal preco, Integer duracaoMinutos) {}

    public static AgendamentoResponseDTO from(Agendamento a, boolean nfseGerada) {
        ClienteInfo cliente = a.getCliente() != null
                ? new ClienteInfo(a.getCliente().getId(), a.getCliente().getNome(), a.getCliente().getTelefone())
                : null;
        FuncionarioInfo funcionario = a.getFuncionario() != null
                ? new FuncionarioInfo(a.getFuncionario().getId(), a.getFuncionario().getNome())
                : null;
        List<ServicoInfo> servicos = a.getServicos() != null
                ? a.getServicos().stream()
                        .map(s -> new ServicoInfo(s.getId(), s.getNome(), s.getPreco(), s.getDuracaoMin()))
                        .toList()
                : List.of();
        return new AgendamentoResponseDTO(
                a.getId(), a.getDataHora(), a.getObservacao(), a.getStatus(),
                a.getValorTotal(), a.getCriadoEm(), nfseGerada, cliente, funcionario, servicos
        );
    }

    public static AgendamentoResponseDTO from(Agendamento a) {
        return from(a, false);
    }
}
