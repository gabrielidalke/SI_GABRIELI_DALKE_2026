package com.salao.modules.notaentrada;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// A chave da nota aparece na URL na ordem Modelo / Série / Número / Fornecedor (não existe ID artificial)
@RestController
@RequestMapping("/api/notas-entrada")
@RequiredArgsConstructor
public class NotaEntradaController {

    private final NotaEntradaService service;

    @GetMapping
    public List<NotaEntradaResumoDTO> listar() {
        return service.listar();
    }

    @GetMapping("/existe")
    public Map<String, Boolean> existe(@RequestParam Integer modelo, @RequestParam Integer serie,
                                       @RequestParam Integer numero, @RequestParam Long fornecedorId) {
        return Map.of("existe", service.existe(new NotaEntradaId(numero, serie, modelo, fornecedorId)));
    }

    @GetMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    public NotaEntradaResponseDTO buscar(@PathVariable Integer modelo, @PathVariable Integer serie,
                                         @PathVariable Integer numero, @PathVariable Long fornecedorId) {
        return service.buscar(new NotaEntradaId(numero, serie, modelo, fornecedorId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotaEntradaResponseDTO criar(@RequestBody @Valid NotaEntradaRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    public NotaEntradaResponseDTO atualizar(@PathVariable Integer modelo, @PathVariable Integer serie,
                                            @PathVariable Integer numero, @PathVariable Long fornecedorId,
                                            @RequestBody @Valid NotaEntradaRequestDTO dto) {
        return service.atualizar(new NotaEntradaId(numero, serie, modelo, fornecedorId), dto);
    }

    @PostMapping("/{modelo}/{serie}/{numero}/{fornecedorId}/confirmar")
    public NotaEntradaResponseDTO confirmar(@PathVariable Integer modelo, @PathVariable Integer serie,
                                            @PathVariable Integer numero, @PathVariable Long fornecedorId) {
        return service.confirmar(new NotaEntradaId(numero, serie, modelo, fornecedorId));
    }

    @DeleteMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer modelo, @PathVariable Integer serie,
                        @PathVariable Integer numero, @PathVariable Long fornecedorId) {
        service.excluir(new NotaEntradaId(numero, serie, modelo, fornecedorId));
    }
}
