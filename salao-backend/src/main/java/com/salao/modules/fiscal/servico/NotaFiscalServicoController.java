package com.salao.modules.fiscal.servico;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais-servico")
@RequiredArgsConstructor
public class NotaFiscalServicoController {

    private final NotaFiscalServicoService service;

    @GetMapping
    public List<NotaFiscalServicoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public NotaFiscalServicoResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping("/gerar/{agendamentoId}")
    @ResponseStatus(HttpStatus.CREATED)
    public NotaFiscalServicoResponseDTO gerar(@PathVariable Long agendamentoId) {
        return service.gerarParaAgendamento(agendamentoId);
    }
}
