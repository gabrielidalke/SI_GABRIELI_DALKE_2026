package com.salao.modules.fornecedor;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fornecedores")
@RequiredArgsConstructor
public class FornecedorController {

    private final FornecedorService service;

    @GetMapping
    public List<FornecedorResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public FornecedorResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FornecedorResponseDTO criar(@RequestBody @Valid FornecedorRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public FornecedorResponseDTO atualizar(@PathVariable Long id,
                                           @RequestBody @Valid FornecedorRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
