package com.salao.modules.geo.cidade;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cidades")
@RequiredArgsConstructor
public class CidadeController {

    private final CidadeService service;

    @GetMapping
    public List<CidadeResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CidadeResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/por-estado/{estadoId}")
    public List<CidadeResponseDTO> listarPorEstado(@PathVariable Long estadoId) {
        return service.listarPorEstado(estadoId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CidadeResponseDTO criar(@RequestBody @Valid CidadeRequestDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public CidadeResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid CidadeRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
