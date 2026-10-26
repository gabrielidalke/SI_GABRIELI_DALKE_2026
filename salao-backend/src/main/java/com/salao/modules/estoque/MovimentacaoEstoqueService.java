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

    // Entrada com custo: usada pela confirmação da Nota de Entrada.
    // Atualiza o custo médio ponderado: (saldo x custo médio + qtd x custo da entrada) / novo saldo
    @Transactional
    public void registrarEntrada(Produto produto, BigDecimal quantidade, BigDecimal custoUnitario,
                                 String origemTipo, Long origemId, String documento) {
        int saldoAnterior = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        int entrada = arredondar(quantidade);
        int novoSaldo = saldoAnterior + entrada;
        BigDecimal custoMedioAnterior = custoMedioDe(produto);

        BigDecimal custoMedioNovo = novoSaldo <= 0
                ? custoUnitario
                : custoMedioAnterior.multiply(BigDecimal.valueOf(Math.max(saldoAnterior, 0)))
                        .add(custoUnitario.multiply(BigDecimal.valueOf(entrada)))
                        .divide(BigDecimal.valueOf(novoSaldo), 4, RoundingMode.HALF_UP);

        produto.setQuantidade(novoSaldo);
        produto.setCustoMedio(custoMedioNovo);
        produtoRepository.save(produto);

        repository.save(MovimentacaoEstoque.builder()
                .produto(produto)
                .tipo("ENTRADA")
                .quantidade(quantidade)
                .saldoAnterior(saldoAnterior)
                .saldoResultante(novoSaldo)
                .custoUnitario(custoUnitario)
                .custoMedioAnterior(custoMedioAnterior)
                .custoMedioPosterior(custoMedioNovo)
                .origemTipo(origemTipo)
                .origemId(origemId)
                .documento(documento)
                .build());
    }

    // Estorno de uma entrada (cancelamento da Nota de Entrada): tira a quantidade do saldo e desfaz o efeito no custo médio.
    // Se parte do estoque já foi vendida/usada, o saldo não cobre o estorno e o cancelamento é barrado.
    @Transactional
    public void estornarEntrada(Produto produto, BigDecimal quantidade, BigDecimal custoDaEntrada, String documento) {
        int saldoAnterior = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        int estorno = arredondar(quantidade);
        int novoSaldo = saldoAnterior - estorno;
        if (novoSaldo < 0)
            throw new RuntimeException("Não é possível cancelar: parte do estoque do produto " + produto.getNome()
                    + " já foi usada (saldo atual " + saldoAnterior + ", a nota deu entrada de " + estorno + ").");

        BigDecimal custoMedioAnterior = custoMedioDe(produto);
        // Sem saldo restante não há média a refazer: mantém o último custo conhecido
        BigDecimal custoMedioNovo = novoSaldo == 0
                ? custoMedioAnterior
                : custoMedioAnterior.multiply(BigDecimal.valueOf(saldoAnterior))
                        .subtract(custoDaEntrada.multiply(BigDecimal.valueOf(estorno)))
                        .divide(BigDecimal.valueOf(novoSaldo), 4, RoundingMode.HALF_UP)
                        .max(BigDecimal.ZERO);

        produto.setQuantidade(novoSaldo);
        produto.setCustoMedio(custoMedioNovo);
        produtoRepository.save(produto);

        repository.save(MovimentacaoEstoque.builder()
                .produto(produto)
                .tipo("SAIDA")
                .quantidade(quantidade)
                .saldoAnterior(saldoAnterior)
                .saldoResultante(novoSaldo)
                .custoUnitario(custoDaEntrada)
                .custoMedioAnterior(custoMedioAnterior)
                .custoMedioPosterior(custoMedioNovo)
                .origemTipo("CANCELAMENTO_NOTA")
                .documento(documento)
                .build());
    }

    // Saída (venda): sai pelo custo médio do momento, que não muda com a saída
    @Transactional
    public void registrarSaida(Produto produto, BigDecimal quantidade, String origemTipo, Long origemId) {
        int saldoAnterior = produto.getQuantidade() != null ? produto.getQuantidade() : 0;
        int novoSaldo = saldoAnterior - arredondar(quantidade);
        if (novoSaldo < 0)
            throw new RuntimeException("Estoque insuficiente para o produto " + produto.getNome());
        BigDecimal custoMedio = custoMedioDe(produto);
        produto.setQuantidade(novoSaldo);
        produtoRepository.save(produto);

        repository.save(MovimentacaoEstoque.builder()
                .produto(produto)
                .tipo("SAIDA")
                .quantidade(quantidade)
                .saldoAnterior(saldoAnterior)
                .saldoResultante(novoSaldo)
                .custoUnitario(custoMedio)
                .custoMedioAnterior(custoMedio)
                .custoMedioPosterior(custoMedio)
                .origemTipo(origemTipo)
                .origemId(origemId)
                .documento(origemId != null ? "Venda #" + origemId : null)
                .build());
    }

    private BigDecimal custoMedioDe(Produto produto) {
        return produto.getCustoMedio() != null ? produto.getCustoMedio() : BigDecimal.ZERO;
    }

    private int arredondar(BigDecimal quantidade) {
        return quantidade.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}
