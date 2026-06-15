package com.salao.modules.pagamento;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parcelas")
@RequiredArgsConstructor
public class ParcelaController {

    private final ParcelaService service;

    @GetMapping
    public List<ParcelaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ParcelaResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ParcelaResponseDTO criar(@RequestBody @Valid ParcelaRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public ParcelaResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid ParcelaRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
