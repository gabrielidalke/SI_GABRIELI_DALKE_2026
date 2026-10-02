package com.salao.modules.pagamento;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/condicoes-pagamento")
@RequiredArgsConstructor
public class CondicaoPagamentoController {

    private final CondicaoPagamentoService service;

    @GetMapping
    public List<CondicaoPagamentoResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CondicaoPagamentoResponseDTO buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // Ex.: GET /api/condicoes-pagamento/1/parcelas?valor=418.00&data=2026-08-01
    @GetMapping("/{id}/parcelas")
    public List<ParcelaPreviaDTO> previaParcelas(@PathVariable Long id,
                                                 @RequestParam BigDecimal valor,
                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.previaParcelas(id, valor, data);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CondicaoPagamentoResponseDTO criar(@RequestBody @Valid CondicaoPagamentoRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public CondicaoPagamentoResponseDTO atualizar(@PathVariable Long id, @RequestBody @Valid CondicaoPagamentoRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
