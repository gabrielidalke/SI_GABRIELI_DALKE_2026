package com.salao.modules.servico;



import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
@RequiredArgsConstructor
public class ServicoController {

    private final ServicoService service;

    @GetMapping
    public List<Servico> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Servico buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Servico criar(@RequestBody @Valid ServicoDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public Servico atualizar(@PathVariable Long id, @RequestBody @Valid ServicoDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}