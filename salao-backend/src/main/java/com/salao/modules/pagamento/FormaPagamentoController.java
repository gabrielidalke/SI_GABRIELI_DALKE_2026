package com.salao.modules.pagamento;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formas-pagamento")
@RequiredArgsConstructor
public class FormaPagamentoController {

    private final FormaPagamentoService service;

    @GetMapping
    public List<FormaPagamentoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public FormaPagamentoResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FormaPagamentoResponseDTO criar(@RequestBody @Valid FormaPagamentoRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public FormaPagamentoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid FormaPagamentoRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
