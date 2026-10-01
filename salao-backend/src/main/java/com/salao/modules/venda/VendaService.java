package com.salao.modules.venda;

import com.salao.modules.cliente.ClienteRepository;
import com.salao.modules.fiscal.saida.NotaFiscalSaidaResponseDTO;
import com.salao.modules.fiscal.saida.NotaFiscalSaidaService;
import com.salao.modules.pagamento.CondicaoPagamentoRepository;
import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository repository;
    private final ClienteRepository clienteRepository;
    private final ProdutoRepository produtoRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final NotaFiscalSaidaService notaFiscalSaidaService;

    public List<VendaResponseDTO> listar() {
        return repository.findAll().stream().map(VendaResponseDTO::from).toList();
    }

    public VendaResponseDTO buscarPorId(Long id) {
        return VendaResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public VendaResponseDTO criar(VendaRequestDTO dto) {
        validarData(dto.dataVenda());
        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        var venda = Venda.builder()
                .numeroVenda(dto.numeroVenda())
                .dataVenda(dto.dataVenda())
                .observacao(dto.observacao())
                .cliente(cliente)
                .condicaoPagamento(resolveCondicaoPagamento(dto.condicaoPagamentoId()))
                .build();

        var itens = dto.itens().stream().map(itemDto -> {
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));
            var subtotal = itemDto.quantidade().multiply(itemDto.precoUnitario());
            return VendaItem.builder()
                    .produto(produto)
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(itemDto.precoUnitario())
                    .subtotal(subtotal)
                    .venda(venda)
                    .build();
        }).toList();

        var valorTotal = itens.stream()
                .map(VendaItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        venda.getItens().addAll(itens);
        venda.setValorTotal(valorTotal);

        return VendaResponseDTO.from(repository.save(venda));
    }

    @Transactional
    public VendaResponseDTO atualizar(Long id, VendaRequestDTO dto) {
        var venda = buscarEntidade(id);
        if (!"RASCUNHO".equals(venda.getStatus()))
            throw new RuntimeException("Venda não pode ser editada no status atual");
        validarData(dto.dataVenda());

        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        venda.setNumeroVenda(dto.numeroVenda());
        venda.setDataVenda(dto.dataVenda());
        venda.setObservacao(dto.observacao());
        venda.setCliente(cliente);
        venda.setCondicaoPagamento(resolveCondicaoPagamento(dto.condicaoPagamentoId()));
        venda.getItens().clear();

        var itens = dto.itens().stream().map(itemDto -> {
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));
            var subtotal = itemDto.quantidade().multiply(itemDto.precoUnitario());
            return VendaItem.builder()
                    .produto(produto)
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(itemDto.precoUnitario())
                    .subtotal(subtotal)
                    .venda(venda)
                    .build();
        }).toList();

        var valorTotal = itens.stream()
                .map(VendaItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        venda.getItens().addAll(itens);
        venda.setValorTotal(valorTotal);

        return VendaResponseDTO.from(repository.save(venda));
    }

    @Transactional
    public VendaResponseDTO validar(Long id) {
        var venda = buscarEntidade(id);
        if (!"RASCUNHO".equals(venda.getStatus()))
            throw new RuntimeException("Venda não pode ser validada no status atual");
        if (venda.getItens().isEmpty())
            throw new RuntimeException("Venda deve ter ao menos um item");
        venda.setStatus("VALIDADA");
        return VendaResponseDTO.from(repository.save(venda));
    }

    @Transactional
    public VendaResponseDTO cancelar(Long id) {
        var venda = buscarEntidade(id);
        if ("NFE_GERADA".equals(venda.getStatus()))
            throw new RuntimeException("Venda com nota fiscal gerada não pode ser cancelada");
        venda.setStatus("CANCELADA");
        return VendaResponseDTO.from(repository.save(venda));
    }

    @Transactional
    public NotaFiscalSaidaResponseDTO gerarNfe(Long id) {
        var venda = buscarEntidade(id);
        if (!"VALIDADA".equals(venda.getStatus()))
            throw new RuntimeException("Nota fiscal só pode ser gerada para vendas validadas");
        var nota = notaFiscalSaidaService.criarParaVenda(venda);
        venda.setStatus("NFE_GERADA");
        repository.save(venda);
        return NotaFiscalSaidaResponseDTO.from(nota);
    }

    private void validarData(java.time.LocalDate dataVenda) {
        if (dataVenda.isAfter(java.time.LocalDate.now()))
            throw new RuntimeException("Data da venda não pode ser posterior à data atual");
    }

    private com.salao.modules.pagamento.CondicaoPagamento resolveCondicaoPagamento(Long id) {
        if (id == null) return null;
        return condicaoPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
    }

    private Venda buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));
    }
}
