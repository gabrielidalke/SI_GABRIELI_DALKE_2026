package com.salao.modules.estoque;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class MovimentacaoEstoqueController {

    private final MovimentacaoEstoqueService service;

    @GetMapping
    public List<MovimentacaoEstoqueResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/produto/{produtoId}")
    public List<MovimentacaoEstoqueResponseDTO> listarPorProduto(@PathVariable Long produtoId) {
        return service.listarPorProduto(produtoId);
    }
}
