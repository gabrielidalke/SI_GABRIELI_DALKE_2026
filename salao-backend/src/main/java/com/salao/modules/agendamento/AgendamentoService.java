package com.salao.modules.agendamento;

import com.salao.modules.cliente.ClienteRepository;
import com.salao.modules.fiscal.servico.NotaFiscalServicoRepository;
import com.salao.modules.funcionario.FuncionarioRepository;
import com.salao.modules.servico.Servico;
import com.salao.modules.servico.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository repository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ServicoRepository servicoRepository;
    private final NotaFiscalServicoRepository nfseRepository;

    public List<AgendamentoResponseDTO> listar() {
        return repository.findAll().stream()
                .map(a -> AgendamentoResponseDTO.from(a, nfseRepository.existsByAgendamentoId(a.getId())))
                .toList();
    }

    public AgendamentoResponseDTO buscarPorId(Long id) {
        var a = buscarEntidade(id);
        return AgendamentoResponseDTO.from(a, nfseRepository.existsByAgendamentoId(a.getId()));
    }

    public List<AgendamentoResponseDTO> listarPorData(LocalDate data) {
        return repository.findByDataHoraBetween(data.atStartOfDay(), data.atTime(23, 59, 59))
                .stream()
                .map(a -> AgendamentoResponseDTO.from(a, nfseRepository.existsByAgendamentoId(a.getId())))
                .toList();
    }

    public AgendamentoResponseDTO criar(AgendamentoRequestDTO dto) {
        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        var funcionario = funcionarioRepository.findById(dto.funcionarioId())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
        List<Servico> servicos = servicoRepository.findAllById(dto.servicoIds());
        BigDecimal total = servicos.stream().map(Servico::getPreco).reduce(BigDecimal.ZERO, BigDecimal::add);

        var agendamento = Agendamento.builder()
                .dataHora(dto.dataHora())
                .observacao(dto.observacao())
                .status("AGENDADO")
                .cliente(cliente)
                .funcionario(funcionario)
                .servicos(servicos)
                .valorTotal(total)
                .build();

        var saved = repository.save(agendamento);
        return AgendamentoResponseDTO.from(saved, nfseRepository.existsByAgendamentoId(saved.getId()));
    }

    public AgendamentoResponseDTO atualizar(Long id, AgendamentoRequestDTO dto) {
        var agendamento = buscarEntidade(id);
        agendamento.setDataHora(dto.dataHora());
        agendamento.setObservacao(dto.observacao());
        agendamento.setCliente(clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado")));
        agendamento.setFuncionario(funcionarioRepository.findById(dto.funcionarioId())
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado")));
        List<Servico> servicos = servicoRepository.findAllById(dto.servicoIds());
        agendamento.setServicos(servicos);
        agendamento.setValorTotal(servicos.stream().map(Servico::getPreco).reduce(BigDecimal.ZERO, BigDecimal::add));
        var saved = repository.save(agendamento);
        return AgendamentoResponseDTO.from(saved, nfseRepository.existsByAgendamentoId(saved.getId()));
    }

    public AgendamentoResponseDTO confirmar(Long id) {
        var agendamento = buscarEntidade(id);
        if (!"AGENDADO".equals(agendamento.getStatus()))
            throw new RuntimeException("Só é possível confirmar agendamentos com status AGENDADO");
        agendamento.setStatus("CONFIRMADO");
        var saved = repository.save(agendamento);
        return AgendamentoResponseDTO.from(saved, nfseRepository.existsByAgendamentoId(saved.getId()));
    }

    public AgendamentoResponseDTO concluir(Long id) {
        var agendamento = buscarEntidade(id);
        if (!"CONFIRMADO".equals(agendamento.getStatus()))
            throw new RuntimeException("Só é possível concluir agendamentos com status CONFIRMADO");
        agendamento.setStatus("CONCLUIDO");
        var saved = repository.save(agendamento);
        return AgendamentoResponseDTO.from(saved, nfseRepository.existsByAgendamentoId(saved.getId()));
    }

    public AgendamentoResponseDTO cancelar(Long id) {
        var agendamento = buscarEntidade(id);
        if ("CONCLUIDO".equals(agendamento.getStatus()) || "CANCELADO".equals(agendamento.getStatus()))
            throw new RuntimeException("Não é possível cancelar agendamento com status " + agendamento.getStatus());
        agendamento.setStatus("CANCELADO");
        var saved = repository.save(agendamento);
        return AgendamentoResponseDTO.from(saved, nfseRepository.existsByAgendamentoId(saved.getId()));
    }

    public void deletar(Long id) {
        var agendamento = buscarEntidade(id);
        if (!"CANCELADO".equals(agendamento.getStatus()))
            throw new RuntimeException("Só é possível excluir agendamentos com status CANCELADO");
        repository.deleteById(id);
    }

    private Agendamento buscarEntidade(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));
    }
}
