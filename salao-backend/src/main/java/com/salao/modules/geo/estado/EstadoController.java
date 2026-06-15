package com.salao.modules.geo.estado;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estados")
@RequiredArgsConstructor
public class EstadoController {

    private final EstadoService service;

    @GetMapping
    public List<EstadoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public EstadoResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/por-pais/{paisId}")
    public List<EstadoResponseDTO> listarPorPais(@PathVariable Long paisId) {
        return service.listarPorPais(paisId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EstadoResponseDTO criar(@RequestBody @Valid EstadoRequestDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public EstadoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid EstadoRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
