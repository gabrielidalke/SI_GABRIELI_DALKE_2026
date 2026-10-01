package com.salao.modules.pedidocompra;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// A chave do pedido aparece na URL na ordem Modelo / Série / Número / Fornecedor
@RestController
@RequestMapping("/api/pedidos-compra")
@RequiredArgsConstructor
public class PedidoCompraController {

    private final PedidoCompraService service;

    @GetMapping
    public List<PedidoCompraResponseDTO> listar(@RequestParam(required = false) List<String> situacoes,
                                                @RequestParam(required = false) Long fornecedorId) {
        return service.listar(situacoes, fornecedorId);
    }

    @GetMapping("/existe")
    public Map<String, Boolean> existe(@RequestParam Integer modelo, @RequestParam Integer serie,
                                       @RequestParam Integer numero, @RequestParam Long fornecedorId) {
        return Map.of("existe", service.existe(new PedidoCompraId(numero, serie, modelo, fornecedorId)));
    }

    @GetMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    public PedidoCompraResponseDTO buscar(@PathVariable Integer modelo, @PathVariable Integer serie,
                                          @PathVariable Integer numero, @PathVariable Long fornecedorId) {
        return service.buscar(new PedidoCompraId(numero, serie, modelo, fornecedorId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoCompraResponseDTO criar(@RequestBody @Valid PedidoCompraRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    public PedidoCompraResponseDTO atualizar(@PathVariable Integer modelo, @PathVariable Integer serie,
                                             @PathVariable Integer numero, @PathVariable Long fornecedorId,
                                             @RequestBody @Valid PedidoCompraRequestDTO dto) {
        return service.atualizar(new PedidoCompraId(numero, serie, modelo, fornecedorId), dto);
    }

    @DeleteMapping("/{modelo}/{serie}/{numero}/{fornecedorId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer modelo, @PathVariable Integer serie,
                        @PathVariable Integer numero, @PathVariable Long fornecedorId) {
        service.excluir(new PedidoCompraId(numero, serie, modelo, fornecedorId));
    }
}
