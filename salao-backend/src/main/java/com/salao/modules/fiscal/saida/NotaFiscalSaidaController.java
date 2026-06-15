package com.salao.modules.fiscal.saida;

import com.salao.modules.fiscal.entrada.TransporteRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais-saida")
@RequiredArgsConstructor
public class NotaFiscalSaidaController {

    private final NotaFiscalSaidaService service;

    @GetMapping
    public List<NotaFiscalSaidaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public NotaFiscalSaidaResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}/transporte")
    public NotaFiscalSaidaResponseDTO atualizarTransporte(@PathVariable Long id,
                                                           @RequestBody TransporteRequestDTO dto) {
        return service.atualizarTransporte(id, dto);
    }
}
