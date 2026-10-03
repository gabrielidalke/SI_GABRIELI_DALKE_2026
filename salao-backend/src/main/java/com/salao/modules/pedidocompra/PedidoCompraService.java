package com.salao.modules.pedidocompra;

import com.salao.modules.classificacaoconta.ClassificacaoConta;
import com.salao.modules.classificacaoconta.ClassificacaoContaRepository;
import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.fornecedor.FornecedorRepository;
import com.salao.modules.log.LogSistemaService;
import com.salao.modules.notaentrada.NotaEntradaRepository;
import com.salao.modules.pagamento.CondicaoPagamento;
import com.salao.modules.pagamento.CondicaoPagamentoRepository;
import com.salao.modules.produto.Produto;
import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PedidoCompraService {

    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final PedidoCompraRepository repository;
    private final PedidoCompraItemRepository itemRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final NotaEntradaRepository notaEntradaRepository;
    private final ClassificacaoContaRepository classificacaoContaRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final LogSistemaService logService;

    // --- consultas ---

    @Transactional(readOnly = true)
    public List<PedidoCompraResponseDTO> listar(List<String> situacoes, Long fornecedorId) {
        return repository.findAllByOrderByDataPedidoDesc().stream()
                .filter(p -> situacoes == null || situacoes.isEmpty() || situacoes.contains(p.getSituacao()))
                .filter(p -> fornecedorId == null || p.getId().getFornecedorId().equals(fornecedorId))
                .map(this::responder)
                .toList();
    }

    @Transactional(readOnly = true)
    public PedidoCompraResponseDTO buscar(PedidoCompraId id) {
        return responder(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public boolean existe(PedidoCompraId id) {
        return repository.existsById(id);
    }

    // --- CRUD ---

    @Transactional
    public PedidoCompraResponseDTO criar(PedidoCompraRequestDTO dto) {
        var id = new PedidoCompraId(dto.numero(), dto.serie(), dto.modelo(), dto.fornecedorId());
        var fornecedor = buscarFornecedorAtivo(dto.fornecedorId());
        if (repository.existsById(id))
            throw new RuntimeException("Já existe um pedido de compra com este modelo/série/número para este fornecedor.");
        validarData(dto.dataPedido());
        var itens = montarItens(id, dto.itens());

        var pedido = repository.save(PedidoCompra.builder()
                .id(id)
                .fornecedor(fornecedor)
                .dataPedido(dto.dataPedido())
                .observacoes(dto.observacoes())
                .condicaoPagamento(resolverCondicao(dto.condicaoPagamentoId()))
                .valorFrete(valor(dto.valorFrete()))
                .valorSeguro(valor(dto.valorSeguro()))
                .outrasDespesas(valor(dto.outrasDespesas()))
                .situacao("ABERTA")
                .build());
        itemRepository.saveAll(itens);

        logService.registrar("PedidoCompra", "CRIOU", "Criou Pedido de Compra " + descricao(id));
        return PedidoCompraResponseDTO.from(pedido, itens);
    }

    @Transactional
    public PedidoCompraResponseDTO atualizar(PedidoCompraId id, PedidoCompraRequestDTO dto) {
        var chaveDto = new PedidoCompraId(dto.numero(), dto.serie(), dto.modelo(), dto.fornecedorId());
        if (!chaveDto.equals(id))
            throw new RuntimeException("A chave do pedido (modelo, série, número e fornecedor) não pode ser alterada.");

        var pedido = repository.buscarParaAtualizar(id)
                .orElseThrow(() -> new RuntimeException("Pedido de compra não encontrado."));
        var antigos = itensDe(id);
        if (antigos.stream().anyMatch(i -> i.getQuantidadeRecebida().signum() > 0))
            throw new RuntimeException("Pedido de compra já possui itens recebidos e não pode ser alterado.");
        validarData(dto.dataPedido());
        // o pedido vem antes da nota: não pode passar a ter data depois da emissão de uma nota já vinculada
        LocalDate primeiraEmissao = notaEntradaRepository.menorEmissaoPorPedido(
                id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId());
        if (primeiraEmissao != null && dto.dataPedido().isAfter(primeiraEmissao))
            throw new RuntimeException("Data do pedido não pode ser posterior à emissão da nota de entrada vinculada ("
                    + primeiraEmissao.format(DATA_BR) + ").");
        var novos = montarItens(id, dto.itens());

        pedido.setDataPedido(dto.dataPedido());
        pedido.setObservacoes(dto.observacoes());
        pedido.setCondicaoPagamento(resolverCondicao(dto.condicaoPagamentoId()));
        pedido.setValorFrete(valor(dto.valorFrete()));
        pedido.setValorSeguro(valor(dto.valorSeguro()));
        pedido.setOutrasDespesas(valor(dto.outrasDespesas()));
        repository.save(pedido);

        Map<Long, PedidoCompraItem> existentes = new HashMap<>();
        antigos.forEach(i -> existentes.put(i.getId().getProdutoId(), i));
        List<PedidoCompraItem> paraSalvar = new ArrayList<>();
        for (PedidoCompraItem novo : novos) {
            var existente = existentes.remove(novo.getId().getProdutoId());
            if (existente != null) {
                existente.setClassificacaoConta(novo.getClassificacaoConta());
                existente.setQuantidade(novo.getQuantidade());
                existente.setValorUnitario(novo.getValorUnitario());
                existente.setDescontoPercentual(novo.getDescontoPercentual());
                existente.setDescontoValor(novo.getDescontoValor());
                paraSalvar.add(existente);
            } else {
                paraSalvar.add(novo);
            }
        }
        itemRepository.deleteAll(existentes.values());
        itemRepository.saveAll(paraSalvar);

        logService.registrar("PedidoCompra", "EDITOU", "Editou Pedido de Compra " + descricao(id));
        return responder(pedido);
    }

    @Transactional
    public void excluir(PedidoCompraId id) {
        var pedido = repository.buscarParaAtualizar(id)
                .orElseThrow(() -> new RuntimeException("Pedido de compra não encontrado."));
        if (notaEntradaRepository.existePorPedido(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId()))
            throw new RuntimeException("Pedido de compra possui notas de entrada vinculadas e não pode ser excluído.");
        if (!"ABERTA".equals(pedido.getSituacao()))
            throw new RuntimeException("Somente pedidos ABERTOS podem ser excluídos.");
        itemRepository.deleteAll(itensDe(id));
        repository.delete(pedido);
        logService.registrar("PedidoCompra", "EXCLUIU", "Excluiu Pedido de Compra " + descricao(id));
    }

    // --- usado pela Nota de Entrada (mesma transação de quem chama) ---

    // O fornecedor faz parte da chave do pedido, então "mesmo fornecedor da nota" é garantido pela busca
    @Transactional
    public PedidoCompra exigirPedido(PedidoCompraId id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido de Compra " + descricao(id) + " não encontrado para este fornecedor."));
    }

    // quantidadeRecebida = quantidadeRecebida + quantidade da nota; depois recalcula a situação do pedido
    @Transactional
    public void aplicarRecebimento(PedidoCompraId id, Map<Long, BigDecimal> quantidadesPorProduto) {
        for (var entrada : quantidadesPorProduto.entrySet()) {
            var itemId = new PedidoCompraItemId(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId(), entrada.getKey());
            var item = itemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("O produto " + nomeProduto(entrada.getKey())
                            + " não faz parte do Pedido de Compra " + descricao(id) + "."));
            item.setQuantidadeRecebida(item.getQuantidadeRecebida().add(entrada.getValue()));
            itemRepository.save(item);
        }
        recalcularSituacao(id);
    }

    // quantidadeRecebida = GREATEST(quantidadeRecebida - quantidade, 0); depois recalcula a situação
    @Transactional
    public void reverterRecebimento(PedidoCompraId id, Map<Long, BigDecimal> quantidadesPorProduto) {
        for (var entrada : quantidadesPorProduto.entrySet()) {
            var itemId = new PedidoCompraItemId(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId(), entrada.getKey());
            itemRepository.findById(itemId).ifPresent(item -> {
                item.setQuantidadeRecebida(item.getQuantidadeRecebida().subtract(entrada.getValue()).max(BigDecimal.ZERO));
                itemRepository.save(item);
            });
        }
        recalcularSituacao(id);
    }

    // CONCLUIDA: todos os itens completos | PARCIAL: algum item recebido | ABERTA: nada recebido
    @Transactional
    public void recalcularSituacao(PedidoCompraId id) {
        var pedido = buscarEntidade(id);
        var itens = itensDe(id);
        long total = itens.size();
        long completos = itens.stream().filter(i -> i.getQuantidadeRecebida().compareTo(i.getQuantidade()) >= 0).count();
        long comAlgo = itens.stream().filter(i -> i.getQuantidadeRecebida().signum() > 0).count();

        String situacao = completos == total ? "CONCLUIDA" : (comAlgo > 0 ? "PARCIAL" : "ABERTA");
        pedido.setSituacao(situacao);
        repository.save(pedido);
    }

    // --- auxiliares ---

    private List<PedidoCompraItem> montarItens(PedidoCompraId id, List<PedidoCompraItemRequestDTO> itensDto) {
        var vistos = new HashSet<Long>();
        List<PedidoCompraItem> itens = new ArrayList<>();
        for (var dto : itensDto) {
            var produto = buscarProdutoAtivo(dto.produtoId());
            if (!vistos.add(produto.getId()))
                throw new RuntimeException("O produto " + produto.getNome() + " aparece mais de uma vez no pedido.");
            BigDecimal quantidade = dto.quantidade().setScale(3, RoundingMode.HALF_UP);
            BigDecimal valorUnitario = dto.valorUnitario().setScale(2, RoundingMode.HALF_UP);
            BigDecimal percentual = dto.descontoPercentual() != null
                    ? dto.descontoPercentual().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
            BigDecimal bruto = quantidade.multiply(valorUnitario).setScale(2, RoundingMode.HALF_UP);
            BigDecimal descontoValor = bruto.multiply(percentual).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            itens.add(PedidoCompraItem.builder()
                    .id(new PedidoCompraItemId(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId(), produto.getId()))
                    .produto(produto)
                    .classificacaoConta(buscarClassificacaoAtiva(dto.classificacaoContaId()))
                    .quantidade(quantidade)
                    .valorUnitario(valorUnitario)
                    .descontoPercentual(percentual)
                    .descontoValor(descontoValor)
                    .quantidadeRecebida(BigDecimal.ZERO)
                    .build());
        }
        return itens;
    }

    private List<PedidoCompraItem> itensDe(PedidoCompraId id) {
        return itemRepository.findByPedido(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId());
    }

    private PedidoCompraResponseDTO responder(PedidoCompra pedido) {
        return PedidoCompraResponseDTO.from(pedido, itensDe(pedido.getId()));
    }

    private PedidoCompra buscarEntidade(PedidoCompraId id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Pedido de compra não encontrado."));
    }

    private Fornecedor buscarFornecedorAtivo(Long id) {
        var fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        if (!Boolean.TRUE.equals(fornecedor.getAtivo()))
            throw new RuntimeException("Fornecedor inativo.");
        return fornecedor;
    }

    private ClassificacaoConta buscarClassificacaoAtiva(Long id) {
        var classificacao = classificacaoContaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classificação da conta não encontrada: " + id));
        if (!Boolean.TRUE.equals(classificacao.getAtivo()))
            throw new RuntimeException("Classificação da conta inativa: " + classificacao.getNome());
        return classificacao;
    }

    private CondicaoPagamento resolverCondicao(Long id) {
        if (id == null) return null;
        return condicaoPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada."));
    }

    private BigDecimal valor(BigDecimal v) {
        return (v != null ? v : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private Produto buscarProdutoAtivo(Long id) {
        var produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + id));
        if (!Boolean.TRUE.equals(produto.getAtivo()))
            throw new RuntimeException("Produto inativo: " + produto.getNome());
        return produto;
    }

    private String nomeProduto(Long id) {
        return produtoRepository.findById(id).map(Produto::getNome).orElse("#" + id);
    }

    private void validarData(LocalDate data) {
        if (data.isAfter(LocalDate.now()))
            throw new RuntimeException("Data do pedido não pode ser posterior à data atual.");
    }

    private String descricao(PedidoCompraId id) {
        return id.getNumero() + "/" + id.getSerie() + " (mod. " + id.getModelo() + ") - Fornecedor " + id.getFornecedorId();
    }
}
