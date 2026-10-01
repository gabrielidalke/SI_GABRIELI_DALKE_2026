package com.salao.modules.transportadora;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transportadoras")
@RequiredArgsConstructor
public class TransportadoraController {

    private final TransportadoraService service;

    @GetMapping
    public List<TransportadoraResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public TransportadoraResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransportadoraResponseDTO criar(@RequestBody @Valid TransportadoraRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public TransportadoraResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid TransportadoraRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
