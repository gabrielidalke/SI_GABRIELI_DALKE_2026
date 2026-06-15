package com.salao.modules.venda;

import com.salao.modules.fiscal.saida.NotaFiscalSaidaResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService service;

    @GetMapping
    public List<VendaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public VendaResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendaResponseDTO criar(@RequestBody @Valid VendaRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public VendaResponseDTO atualizar(@PathVariable Long id,
                                      @RequestBody @Valid VendaRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @PostMapping("/{id}/validar")
    public VendaResponseDTO validar(@PathVariable Long id) {
        return service.validar(id);
    }

    @PostMapping("/{id}/cancelar")
    public VendaResponseDTO cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    @PostMapping("/{id}/gerar-nfe")
    public NotaFiscalSaidaResponseDTO gerarNfe(@PathVariable Long id) {
        return service.gerarNfe(id);
    }
}
