package com.salao.modules.estoque;

import com.salao.modules.produto.Produto;
import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoEstoqueService {

    private final MovimentacaoEstoqueRepository repository;
    private final ProdutoRepository produtoRepository;

    public List<MovimentacaoEstoqueResponseDTO> listar() {
        return repository.findAllByOrderByCriadoEmDesc().stream().map(MovimentacaoEstoqueResponseDTO::from).toList();
    }

    public List<MovimentacaoEstoqueResponseDTO> listarPorProduto(Long produtoId) {
        return repository.findByProdutoIdOrderByCriadoEmDesc(produtoId).stream().map(MovimentacaoEstoqueResponseDTO::from).toList();
    }

    // Entrada com custo: usada pela confirmação da Nota de Entrada
    @Transactional
    public void registrarEntrada(Produto produto, BigDecimal quantidade, BigDecimal custoUnitario,
                                 String origemTipo, Long origemId, String documento) {
        int saldoAnterior = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        int novoSaldo = saldoAnterior + arredondar(quantidade);
        produto.setQuantidade(novoSaldo);
        produtoRepository.save(produto);

        repository.save(MovimentacaoEstoque.builder()
                .produto(produto)
                .tipo("ENTRADA")
                .quantidade(quantidade)
                .saldoAnterior(saldoAnterior)
                .saldoResultante(novoSaldo)
                .custoUnitario(custoUnitario)
                .origemTipo(origemTipo)
                .origemId(origemId)
                .documento(documento)
                .build());
    }

    @Transactional
    public void registrarSaida(Produto produto, BigDecimal quantidade, String origemTipo, Long origemId) {
        int saldoAnterior = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        int novoSaldo = saldoAnterior - arredondar(quantidade);
        if (novoSaldo < 0)
            throw new RuntimeException("Estoque insuficiente para o produto " + produto.getNome());
        produto.setQuantidade(novoSaldo);
        produtoRepository.save(produto);

        repository.save(MovimentacaoEstoque.builder()
                .produto(produto)
                .tipo("SAIDA")
                .quantidade(quantidade)
                .saldoAnterior(saldoAnterior)
                .saldoResultante(novoSaldo)
                .origemTipo(origemTipo)
                .origemId(origemId)
                .documento(origemId != null ? "Venda #" + origemId : null)
                .build());
    }

    private int arredondar(BigDecimal quantidade) {
        return quantidade.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}
