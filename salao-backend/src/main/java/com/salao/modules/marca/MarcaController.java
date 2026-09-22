package com.salao.modules.marca;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService service;

    @GetMapping
    public List<MarcaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public MarcaResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MarcaResponseDTO criar(@RequestBody @Valid MarcaRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public MarcaResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid MarcaRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
