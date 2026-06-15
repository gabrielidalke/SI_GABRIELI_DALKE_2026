package com.salao.modules.fiscal.servico;

import com.salao.modules.agendamento.AgendamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalServicoService {

    private final NotaFiscalServicoRepository repository;
    private final AgendamentoRepository agendamentoRepository;

    @Transactional(readOnly = true)
    public List<NotaFiscalServicoResponseDTO> listar() {
        return repository.findAll().stream().map(NotaFiscalServicoResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public NotaFiscalServicoResponseDTO buscarPorId(Long id) {
        return NotaFiscalServicoResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public NotaFiscalServicoResponseDTO gerarParaAgendamento(Long agendamentoId) {
        var agendamento = agendamentoRepository.findById(agendamentoId)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (!"CONCLUIDO".equals(agendamento.getStatus()))
            throw new RuntimeException("NFS-e só pode ser gerada para agendamentos concluídos");

        if (repository.existsByAgendamentoId(agendamentoId))
            throw new RuntimeException("NFS-e já foi gerada para este agendamento");

        var nota = repository.save(NotaFiscalServico.builder()
                .agendamento(agendamento)
                .cliente(agendamento.getCliente())
                .valorTotal(agendamento.getValorTotal())
                .serie("1")
                .build());

        nota.setNumeroNota("NFSE-" + String.format("%06d", nota.getId()));
        nota = repository.save(nota);

        return NotaFiscalServicoResponseDTO.from(nota);
    }

    private NotaFiscalServico buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota fiscal de serviço não encontrada"));
    }
}
