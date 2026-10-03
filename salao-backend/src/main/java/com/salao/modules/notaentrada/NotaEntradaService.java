package com.salao.modules.notaentrada;

import com.salao.modules.classificacaoconta.ClassificacaoConta;
import com.salao.modules.classificacaoconta.ClassificacaoContaRepository;
import com.salao.modules.estoque.MovimentacaoEstoqueService;
import com.salao.modules.financeiro.ContasPagar;
import com.salao.modules.financeiro.ContasPagarRepository;
import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.fornecedor.FornecedorRepository;
import com.salao.modules.log.LogSistemaService;
import com.salao.modules.pagamento.CondicaoPagamento;
import com.salao.modules.pagamento.CondicaoPagamentoRepository;
import com.salao.modules.pagamento.GeradorParcelas;
import com.salao.modules.pagamento.Parcela;
import com.salao.modules.pedidocompra.PedidoCompra;
import com.salao.modules.pedidocompra.PedidoCompraId;
import com.salao.modules.pedidocompra.PedidoCompraService;
import com.salao.modules.produto.Produto;
import com.salao.modules.produto.ProdutoRepository;
import com.salao.modules.transportadora.Transportadora;
import com.salao.modules.transportadora.TransportadoraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * Nota de Entrada: não é só um CRUD. A confirmação integra Estoque e Contas a Pagar, e a ligação com o
 * Pedido de Compra atualiza as quantidades recebidas. Cada operação roda numa única transação: se qualquer
 * etapa falhar, tudo é desfeito (ROLLBACK).
 */
@Service
@RequiredArgsConstructor
public class NotaEntradaService {

    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final DateTimeFormatter DATA_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final NotaEntradaRepository repository;
    private final NotaEntradaItemRepository itemRepository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final TransportadoraRepository transportadoraRepository;
    private final ClassificacaoContaRepository classificacaoContaRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final ContasPagarRepository contasPagarRepository;
    private final MovimentacaoEstoqueService estoqueService;
    private final PedidoCompraService pedidoCompraService;
    private final LogSistemaService logService;

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public List<NotaEntradaResumoDTO> listar() {
        return repository.findAllByOrderByDataEmissaoDesc().stream().map(NotaEntradaResumoDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public NotaEntradaResponseDTO buscar(NotaEntradaId id) {
        return responder(buscarEntidade(id));
    }

    @Transactional(readOnly = true)
    public boolean existe(NotaEntradaId id) {
        return repository.existsById(id);
    }

    // ------------------------------------------------------------------ criação

    @Transactional
    public NotaEntradaResponseDTO criar(NotaEntradaRequestDTO dto) {
        var id = chave(dto);
        var fornecedor = buscarFornecedorAtivo(dto.fornecedorId());
        if (repository.existsById(id))
            throw new RuntimeException("Já existe uma nota de entrada com este modelo/série/número para este fornecedor.");
        validarCabecalho(dto);
        var pedidoId = pedidoDe(dto);
        if (pedidoId != null) exigirEmissaoAposPedido(dto, pedidoCompraService.exigirPedido(pedidoId));

        var itens = montarItens(id, dto.itens(), Map.of());

        // A situação inicial é sempre PENDENTE, mesmo que o cliente tente enviar outra
        var nota = NotaEntrada.builder().id(id).fornecedor(fornecedor).situacao("PENDENTE").build();
        preencherCabecalho(nota, dto);
        calcularTotais(nota, itens);

        nota = repository.save(nota);
        itemRepository.saveAll(itens);
        if (pedidoId != null)
            pedidoCompraService.aplicarRecebimento(pedidoId, quantidadesPorProduto(itens));

        logService.registrar("NotaEntrada", "CRIOU", "Criou Nota de Entrada " + descricao(id));
        return responder(nota);
    }

    // ------------------------------------------------------------------ edição

    @Transactional
    public NotaEntradaResponseDTO atualizar(NotaEntradaId id, NotaEntradaRequestDTO dto) {
        if (!chave(dto).equals(id))
            throw new RuntimeException("A chave da nota (modelo, série, número e fornecedor) não pode ser alterada.");

        var nota = buscarParaAtualizar(id);
        exigirPendente(nota, "editadas");
        validarCabecalho(dto);
        var pedidoNovo = pedidoDe(dto);
        if (pedidoNovo != null) exigirEmissaoAposPedido(dto, pedidoCompraService.exigirPedido(pedidoNovo));

        var itensAntigos = itensDe(id);
        Map<Long, Long> classificacoesAntigas = new HashMap<>();
        itensAntigos.forEach(i -> classificacoesAntigas.put(i.getId().getProdutoId(), i.getClassificacaoConta().getId()));
        var quantidadesAntigas = quantidadesPorProduto(itensAntigos);
        var pedidoAnterior = pedidoDe(nota);

        var novos = montarItens(id, dto.itens(), classificacoesAntigas);
        preencherCabecalho(nota, dto);
        calcularTotais(nota, novos);

        // 1) desfaz o recebimento antigo do pedido  2) troca os itens  3) aplica o novo recebimento
        if (pedidoAnterior != null)
            pedidoCompraService.reverterRecebimento(pedidoAnterior, quantidadesAntigas);

        sincronizarItens(itensAntigos, novos);
        repository.save(nota);

        if (pedidoNovo != null)
            pedidoCompraService.aplicarRecebimento(pedidoNovo, quantidadesPorProduto(novos));

        logService.registrar("NotaEntrada", "EDITOU", "Editou Nota de Entrada " + descricao(id));
        return responder(nota);
    }

    // ------------------------------------------------------------------ confirmação (conferência)

    @Transactional
    public NotaEntradaResponseDTO confirmar(NotaEntradaId id) {
        var nota = buscarParaAtualizar(id);   // SELECT ... FOR UPDATE
        exigirPendente(nota, "confirmadas");

        var itens = itensDe(id);
        if (itens.isEmpty())
            throw new RuntimeException("A nota não pode ser confirmada porque não possui produtos.");
        if (nota.getValorTotal().signum() <= 0)
            throw new RuntimeException("O valor total da nota deve ser maior que zero para confirmar.");

        // Valida todos os itens antes de mexer em estoque ou contas
        Map<NotaEntradaItem, BigDecimal> custos = new LinkedHashMap<>();
        for (var item : itens) {
            String nome = item.getProduto().getNome();
            if (item.getQuantidade().signum() <= 0)
                throw new RuntimeException("Produto " + nome + ": a quantidade deve ser maior que zero.");
            // Custo usado no estoque: custoFinal quando > 0; senão o valor unitário
            BigDecimal custo = item.getCustoFinal().signum() > 0 ? item.getCustoFinal() : item.getValorUnitario();
            if (custo.signum() <= 0)
                throw new RuntimeException("Produto " + nome + ": o custo deve ser maior que zero.");
            custos.put(item, custo);
        }

        String documento = "Entrada da Nota " + id.getNumero() + "/" + id.getSerie() + " - Fornecedor " + id.getFornecedorId();
        for (var entrada : custos.entrySet()) {
            var item = entrada.getKey();
            estoqueService.registrarEntrada(item.getProduto(), item.getQuantidade(), entrada.getValue(),
                    "NOTA_ENTRADA", null, documento);
        }

        gerarContasPagar(nota);

        nota.setSituacao("CONFERIDA");
        if (nota.getDataChegada() == null) nota.setDataChegada(LocalDate.now());
        repository.save(nota);

        logService.registrar("NotaEntrada", "CONFIRMOU", "Conferiu Nota de Entrada " + descricao(id));
        return responder(nota);
    }

    // ------------------------------------------------------------------ exclusão

    @Transactional
    public void excluir(NotaEntradaId id) {
        var nota = buscarParaAtualizar(id);
        exigirPendente(nota, "excluídas");

        var itens = itensDe(id);
        var pedido = pedidoDe(nota);
        if (pedido != null)
            pedidoCompraService.reverterRecebimento(pedido, quantidadesPorProduto(itens));

        itemRepository.deleteAll(itens);
        repository.delete(nota);

        logService.registrar("NotaEntrada", "EXCLUIU", "Excluiu Nota de Entrada " + descricao(id));
    }

    // ------------------------------------------------------------------ validações do cabeçalho

    private void validarCabecalho(NotaEntradaRequestDTO dto) {
        LocalDate hoje = LocalDate.now();
        if (dto.dataEmissao().isAfter(hoje))
            throw new RuntimeException("Data de emissão não pode ser posterior à data atual.");
        if (dto.dataChegada() != null) {
            if (dto.dataChegada().isBefore(dto.dataEmissao()))
                throw new RuntimeException("Data de chegada não pode ser anterior à data de emissão.");
            if (dto.dataChegada().isAfter(hoje))
                throw new RuntimeException("Data de chegada não pode ser posterior à data atual.");
        }
    }

    // A nota do fornecedor só existe depois do pedido: emissão no mesmo dia do pedido é permitida
    private void exigirEmissaoAposPedido(NotaEntradaRequestDTO dto, PedidoCompra pedido) {
        if (dto.dataEmissao().isBefore(pedido.getDataPedido()))
            throw new RuntimeException("Data de emissão não pode ser anterior à data do Pedido de Compra ("
                    + pedido.getDataPedido().format(DATA_BR) + ").");
    }

    private void preencherCabecalho(NotaEntrada nota, NotaEntradaRequestDTO dto) {
        nota.setDataEmissao(dto.dataEmissao());
        nota.setDataChegada(dto.dataChegada());
        nota.setTipoFrete(vazioParaNulo(dto.tipoFrete()));
        nota.setValorFrete(valor(dto.valorFrete()));
        nota.setValorSeguro(valor(dto.valorSeguro()));
        nota.setOutrasDespesas(valor(dto.outrasDespesas()));
        nota.setCondicaoPagamento(resolverCondicao(dto.condicaoPagamentoId()));
        nota.setTransportadora(resolverTransportadora(dto.transportadoraId()));
        String placa = vazioParaNulo(dto.placaVeiculo());
        nota.setPlacaVeiculo(placa != null ? placa.toUpperCase() : null);
        nota.setObservacoes(vazioParaNulo(dto.observacoes()));

        var pedido = pedidoDe(dto);
        nota.setPedidoNumero(pedido != null ? pedido.getNumero() : null);
        nota.setPedidoSerie(pedido != null ? pedido.getSerie() : null);
        nota.setPedidoModelo(pedido != null ? pedido.getModelo() : null);
    }

    // ------------------------------------------------------------------ itens e cálculos

    private List<NotaEntradaItem> montarItens(NotaEntradaId id, List<NotaEntradaItemRequestDTO> itensDto,
                                              Map<Long, Long> classificacoesAnteriores) {
        List<NotaEntradaItem> itens = new ArrayList<>();
        if (itensDto == null) return itens;

        var vistos = new HashSet<Long>();
        for (var dto : itensDto) {
            var produto = buscarProdutoAtivo(dto.produtoId());
            if (!vistos.add(produto.getId()))
                throw new RuntimeException("O produto " + produto.getNome() + " aparece mais de uma vez nesta nota.");

            var classificacao = buscarClassificacaoAtiva(dto.classificacaoContaId());
            Long anterior = classificacoesAnteriores.get(produto.getId());
            if (anterior != null && !anterior.equals(classificacao.getId()))
                throw new RuntimeException("A classificação da conta de um item já adicionado não pode ser alterada (produto "
                        + produto.getNome() + ").");

            BigDecimal quantidade = dto.quantidade().setScale(3, RoundingMode.HALF_UP);
            BigDecimal valorUnitario = dto.valorUnitario().setScale(2, RoundingMode.HALF_UP);
            BigDecimal percentual = dto.descontoPercentual() != null
                    ? dto.descontoPercentual().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2);
            BigDecimal bruto = quantidade.multiply(valorUnitario).setScale(2, RoundingMode.HALF_UP);
            BigDecimal descontoValor = bruto.multiply(percentual).divide(CEM, 2, RoundingMode.HALF_UP);

            itens.add(NotaEntradaItem.builder()
                    .id(new NotaEntradaItemId(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId(), produto.getId()))
                    .produto(produto)
                    .classificacaoConta(classificacao)
                    .quantidade(quantidade)
                    .valorUnitario(valorUnitario)
                    .valorTotal(bruto)
                    .descontoPercentual(percentual)
                    .descontoValor(descontoValor)
                    .build());
        }
        return itens;
    }

    // Totais do cabeçalho, rateios por item e custo final (custo unitário que alimenta o estoque)
    private void calcularTotais(NotaEntrada nota, List<NotaEntradaItem> itens) {
        BigDecimal produtos = soma(itens, NotaEntradaItem::getValorTotal);
        BigDecimal desconto = soma(itens, NotaEntradaItem::getDescontoValor);

        ratear(itens, nota.getValorFrete(), NotaEntradaItem::setRateioFrete);
        ratear(itens, nota.getValorSeguro(), NotaEntradaItem::setRateioSeguro);
        ratear(itens, nota.getOutrasDespesas(), NotaEntradaItem::setRateioOutras);

        for (var item : itens) {
            BigDecimal liquido = item.getValorTotal().subtract(item.getDescontoValor());
            BigDecimal custoTotal = liquido.add(item.getRateioFrete()).add(item.getRateioSeguro()).add(item.getRateioOutras());
            item.setCustoFinal(custoTotal.divide(item.getQuantidade(), 4, RoundingMode.HALF_UP));
        }

        nota.setValorProdutos(produtos);
        nota.setValorDesconto(desconto);
        nota.setValorTotal(produtos.subtract(desconto)
                .add(nota.getValorFrete()).add(nota.getValorSeguro()).add(nota.getOutrasDespesas()));
    }

    // Divide "total" entre os itens proporcionalmente ao valor líquido; o último item absorve o arredondamento
    private void ratear(List<NotaEntradaItem> itens, BigDecimal total, BiConsumer<NotaEntradaItem, BigDecimal> destino) {
        if (itens.isEmpty()) return;
        if (total.signum() == 0) {
            itens.forEach(i -> destino.accept(i, BigDecimal.ZERO.setScale(2)));
            return;
        }
        BigDecimal base = itens.stream()
                .map(i -> i.getValorTotal().subtract(i.getDescontoValor()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal acumulado = BigDecimal.ZERO;
        for (int idx = 0; idx < itens.size(); idx++) {
            var item = itens.get(idx);
            BigDecimal parte;
            if (idx == itens.size() - 1) {
                parte = total.subtract(acumulado);
            } else if (base.signum() > 0) {
                BigDecimal liquido = item.getValorTotal().subtract(item.getDescontoValor());
                parte = total.multiply(liquido).divide(base, 2, RoundingMode.HALF_UP);
            } else {
                parte = total.divide(BigDecimal.valueOf(itens.size()), 2, RoundingMode.HALF_UP);
            }
            destino.accept(item, parte);
            acumulado = acumulado.add(parte);
        }
    }

    // Atualiza no lugar os itens que já existiam (mesmo produto), remove os que saíram e insere os novos
    private void sincronizarItens(List<NotaEntradaItem> antigos, List<NotaEntradaItem> novos) {
        Map<Long, NotaEntradaItem> existentes = new HashMap<>();
        antigos.forEach(i -> existentes.put(i.getId().getProdutoId(), i));

        List<NotaEntradaItem> paraSalvar = new ArrayList<>();
        for (var novo : novos) {
            var existente = existentes.remove(novo.getId().getProdutoId());
            if (existente == null) {
                paraSalvar.add(novo);
                continue;
            }
            existente.setQuantidade(novo.getQuantidade());
            existente.setValorUnitario(novo.getValorUnitario());
            existente.setValorTotal(novo.getValorTotal());
            existente.setDescontoPercentual(novo.getDescontoPercentual());
            existente.setDescontoValor(novo.getDescontoValor());
            existente.setRateioFrete(novo.getRateioFrete());
            existente.setRateioSeguro(novo.getRateioSeguro());
            existente.setRateioOutras(novo.getRateioOutras());
            existente.setCustoFinal(novo.getCustoFinal());
            paraSalvar.add(existente);
        }
        itemRepository.deleteAll(existentes.values());
        itemRepository.saveAll(paraSalvar);
    }

    private Map<Long, BigDecimal> quantidadesPorProduto(List<NotaEntradaItem> itens) {
        Map<Long, BigDecimal> mapa = new LinkedHashMap<>();
        itens.forEach(i -> mapa.merge(i.getId().getProdutoId(), i.getQuantidade(), BigDecimal::add));
        return mapa;
    }

    // ------------------------------------------------------------------ contas a pagar

    // Uma conta por parcela da condição de pagamento; sem condição, uma única conta na data de emissão.
    // O cálculo vem de GeradorParcelas, o mesmo usado na prévia "Gerar Parcelas" da tela.
    private void gerarContasPagar(NotaEntrada nota) {
        var id = nota.getId();
        var condicao = nota.getCondicaoPagamento();
        BigDecimal desconto = condicao != null && condicao.getDesconto() != null ? condicao.getDesconto() : BigDecimal.ZERO;
        BigDecimal multa = condicao != null && condicao.getMulta() != null ? condicao.getMulta() : BigDecimal.ZERO;
        BigDecimal juro = condicao != null && condicao.getJuro() != null ? condicao.getJuro() : BigDecimal.ZERO;
        String base = "Nota " + id.getNumero() + "/" + id.getSerie() + " (mod. " + id.getModelo() + ")";

        for (var p : GeradorParcelas.calcular(condicao, nota.getValorTotal(), nota.getDataEmissao())) {
            String descricao = p.parcela() != null ? base + " - Parcela " + p.numero() + "/" + p.total() : base;
            contasPagarRepository.save(contaDaNota(nota, descricao, p.valor(), p.dataVencimento(), p.parcela(), desconto, multa, juro));
        }
    }

    private ContasPagar contaDaNota(NotaEntrada nota, String descricao, BigDecimal valor, LocalDate vencimento,
                                    Parcela parcela, BigDecimal desconto, BigDecimal multa, BigDecimal juro) {
        var id = nota.getId();
        return ContasPagar.builder()
                .descricao(descricao)
                .valor(valor)
                .dataVencimento(vencimento)
                .fornecedor(nota.getFornecedor())
                .parcela(parcela)
                .notaNumero(id.getNumero())
                .notaSerie(id.getSerie())
                .notaModelo(id.getModelo())
                .notaFornecedorId(id.getFornecedorId())
                .percentualDesconto(desconto)
                .percentualMulta(multa)
                .percentualJuro(juro)
                .build();
    }

    // ------------------------------------------------------------------ auxiliares

    private NotaEntradaId chave(NotaEntradaRequestDTO dto) {
        return new NotaEntradaId(dto.numero(), dto.serie(), dto.modelo(), dto.fornecedorId());
    }

    // Os três campos do pedido vêm juntos ou não vêm; o fornecedor do pedido é o mesmo da nota
    private PedidoCompraId pedidoDe(NotaEntradaRequestDTO dto) {
        int informados = (dto.pedidoNumero() != null ? 1 : 0) + (dto.pedidoSerie() != null ? 1 : 0)
                + (dto.pedidoModelo() != null ? 1 : 0);
        if (informados == 0) return null;
        if (informados != 3)
            throw new RuntimeException("Para vincular um Pedido de Compra informe número, série e modelo do pedido.");
        return new PedidoCompraId(dto.pedidoNumero(), dto.pedidoSerie(), dto.pedidoModelo(), dto.fornecedorId());
    }

    private PedidoCompraId pedidoDe(NotaEntrada nota) {
        if (nota.getPedidoNumero() == null || nota.getPedidoSerie() == null || nota.getPedidoModelo() == null) return null;
        return new PedidoCompraId(nota.getPedidoNumero(), nota.getPedidoSerie(), nota.getPedidoModelo(), nota.getId().getFornecedorId());
    }

    private void exigirPendente(NotaEntrada nota, String acao) {
        if (!"PENDENTE".equalsIgnoreCase(nota.getSituacao()))
            throw new RuntimeException("Somente notas PENDENTES podem ser " + acao + ".");
    }

    private List<NotaEntradaItem> itensDe(NotaEntradaId id) {
        return itemRepository.findByNota(id.getNumero(), id.getSerie(), id.getModelo(), id.getFornecedorId());
    }

    private NotaEntradaResponseDTO responder(NotaEntrada nota) {
        return NotaEntradaResponseDTO.from(nota, itensDe(nota.getId()));
    }

    private NotaEntrada buscarEntidade(NotaEntradaId id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Nota de entrada não encontrada."));
    }

    private NotaEntrada buscarParaAtualizar(NotaEntradaId id) {
        return repository.buscarParaAtualizar(id).orElseThrow(() -> new RuntimeException("Nota de entrada não encontrada."));
    }

    private Fornecedor buscarFornecedorAtivo(Long id) {
        var fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado."));
        if (!Boolean.TRUE.equals(fornecedor.getAtivo()))
            throw new RuntimeException("Fornecedor inativo.");
        return fornecedor;
    }

    private Produto buscarProdutoAtivo(Long id) {
        var produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + id));
        if (!Boolean.TRUE.equals(produto.getAtivo()))
            throw new RuntimeException("Produto inativo: " + produto.getNome());
        return produto;
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

    private Transportadora resolverTransportadora(Long id) {
        if (id == null) return null;
        var transportadora = transportadoraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transportadora não encontrada."));
        if (!Boolean.TRUE.equals(transportadora.getAtivo()))
            throw new RuntimeException("Transportadora inativa.");
        return transportadora;
    }

    private BigDecimal valor(BigDecimal v) {
        return (v != null ? v : BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal soma(List<NotaEntradaItem> itens, Function<NotaEntradaItem, BigDecimal> campo) {
        return itens.stream().map(campo).reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private String descricao(NotaEntradaId id) {
        return id.getNumero() + "/" + id.getSerie() + " (mod. " + id.getModelo() + ") - Fornecedor " + id.getFornecedorId();
    }
}
