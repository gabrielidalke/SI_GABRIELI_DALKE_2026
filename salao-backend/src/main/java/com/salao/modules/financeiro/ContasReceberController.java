package com.salao.modules.financeiro;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/contas-receber")
@RequiredArgsConstructor
public class ContasReceberController {

    private final ContasReceberService service;

    @GetMapping
    public List<ContasReceberResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ContasReceberResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContasReceberResponseDTO criar(@RequestBody @Valid ContasReceberRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public ContasReceberResponseDTO atualizar(@PathVariable Long id,
                                               @RequestBody @Valid ContasReceberRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    @GetMapping("/{id}/calculo-baixa")
    public CalculoBaixa calcularBaixa(@PathVariable Long id,
                                      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return service.calcularRecebimento(id, data);
    }

    @PostMapping("/{id}/receber")
    public ContasReceberResponseDTO receber(@PathVariable Long id,
                                            @RequestBody(required = false) BaixaRequestDTO dto) {
        return service.receber(id, dto != null ? dto.data() : null);
    }

    @PostMapping("/{id}/cancelar")
    public ContasReceberResponseDTO cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }
}
