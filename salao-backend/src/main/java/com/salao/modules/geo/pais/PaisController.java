package com.salao.modules.geo.pais;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paises")
@RequiredArgsConstructor
public class PaisController {

    private final PaisService service;

    @GetMapping
    public List<PaisResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public PaisResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaisResponseDTO criar(@RequestBody @Valid PaisRequestDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public PaisResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid PaisRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
