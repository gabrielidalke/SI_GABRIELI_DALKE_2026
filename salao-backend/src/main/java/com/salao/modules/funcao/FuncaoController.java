package com.salao.modules.funcao;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcoes")
@RequiredArgsConstructor
public class FuncaoController {

    private final FuncaoService service;

    @GetMapping
    public List<FuncaoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public FuncaoResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FuncaoResponseDTO criar(@RequestBody @Valid FuncaoRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public FuncaoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid FuncaoRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
