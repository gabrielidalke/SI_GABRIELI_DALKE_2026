package com.salao.modules.fiscal.entrada;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais-entrada")
@RequiredArgsConstructor
public class NotaFiscalEntradaController {

    private final NotaFiscalEntradaService service;

    @GetMapping
    public List<NotaFiscalEntradaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public NotaFiscalEntradaResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}/transporte")
    public NotaFiscalEntradaResponseDTO atualizarTransporte(@PathVariable Long id,
                                                             @RequestBody TransporteRequestDTO dto) {
        return service.atualizarDadosTransporte(id, dto.transportadoraNome(), dto.veiculoPlaca());
    }
}
