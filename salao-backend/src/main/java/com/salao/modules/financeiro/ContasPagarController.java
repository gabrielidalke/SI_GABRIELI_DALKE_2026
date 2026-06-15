package com.salao.modules.financeiro;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contas-pagar")
@RequiredArgsConstructor
public class ContasPagarController {

    private final ContasPagarService service;

    @GetMapping
    public List<ContasPagarResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ContasPagarResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContasPagarResponseDTO criar(@RequestBody @Valid ContasPagarRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public ContasPagarResponseDTO atualizar(@PathVariable Long id,
                                             @RequestBody @Valid ContasPagarRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    @PostMapping("/{id}/pagar")
    public ContasPagarResponseDTO pagar(@PathVariable Long id) {
        return service.pagar(id);
    }

    @PostMapping("/{id}/cancelar")
    public ContasPagarResponseDTO cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }
}
