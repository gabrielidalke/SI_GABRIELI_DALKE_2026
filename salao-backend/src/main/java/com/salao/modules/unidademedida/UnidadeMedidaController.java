package com.salao.modules.unidademedida;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidades-medida")
@RequiredArgsConstructor
public class UnidadeMedidaController {

    private final UnidadeMedidaService service;

    @GetMapping
    public List<UnidadeMedidaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public UnidadeMedidaResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UnidadeMedidaResponseDTO criar(@RequestBody @Valid UnidadeMedidaRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public UnidadeMedidaResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid UnidadeMedidaRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
