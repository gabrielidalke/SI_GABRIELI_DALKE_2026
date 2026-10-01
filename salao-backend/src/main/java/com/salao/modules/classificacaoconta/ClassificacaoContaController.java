package com.salao.modules.classificacaoconta;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classificacoes-conta")
@RequiredArgsConstructor
public class ClassificacaoContaController {

    private final ClassificacaoContaService service;

    @GetMapping
    public List<ClassificacaoConta> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ClassificacaoConta buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassificacaoConta criar(@RequestBody @Valid ClassificacaoContaDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public ClassificacaoConta atualizar(@PathVariable Long id, @RequestBody @Valid ClassificacaoContaDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
