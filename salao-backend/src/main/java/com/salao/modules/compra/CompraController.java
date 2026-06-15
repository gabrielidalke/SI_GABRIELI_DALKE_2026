package com.salao.modules.compra;

import com.salao.modules.fiscal.entrada.NotaFiscalEntradaResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService service;

    @GetMapping
    public List<CompraResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CompraResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompraResponseDTO criar(@RequestBody @Valid CompraRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public CompraResponseDTO atualizar(@PathVariable Long id,
                                       @RequestBody @Valid CompraRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @PostMapping("/{id}/validar")
    public CompraResponseDTO validar(@PathVariable Long id) {
        return service.validar(id);
    }

    @PostMapping("/{id}/cancelar")
    public CompraResponseDTO cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }

    @PostMapping("/{id}/gerar-nfe")
    public NotaFiscalEntradaResponseDTO gerarNfe(@PathVariable Long id) {
        return service.gerarNfe(id);
    }
}
