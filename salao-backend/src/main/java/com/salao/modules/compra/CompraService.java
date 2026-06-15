package com.salao.modules.compra;

import com.salao.modules.fiscal.entrada.NotaFiscalEntradaResponseDTO;
import com.salao.modules.fiscal.entrada.NotaFiscalEntradaService;
import com.salao.modules.fornecedor.FornecedorRepository;
import com.salao.modules.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompraService {

    private final CompraRepository repository;
    private final FornecedorRepository fornecedorRepository;
    private final ProdutoRepository produtoRepository;
    private final NotaFiscalEntradaService notaFiscalEntradaService;

    public List<CompraResponseDTO> listar() {
        return repository.findAll().stream().map(CompraResponseDTO::from).toList();
    }

    public CompraResponseDTO buscarPorId(Long id) {
        return CompraResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public CompraResponseDTO criar(CompraRequestDTO dto) {
        var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        var compra = Compra.builder()
                .numeroCompra(dto.numeroCompra())
                .dataCompra(dto.dataCompra())
                .observacao(dto.observacao())
                .fornecedor(fornecedor)
                .build();

        var itens = dto.itens().stream().map(itemDto -> {
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));
            var subtotal = itemDto.quantidade().multiply(itemDto.precoUnitario());
            return CompraItem.builder()
                    .produto(produto)
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(itemDto.precoUnitario())
                    .subtotal(subtotal)
                    .compra(compra)
                    .build();
        }).toList();

        var valorTotal = itens.stream()
                .map(CompraItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        compra.getItens().addAll(itens);
        compra.setValorTotal(valorTotal);

        return CompraResponseDTO.from(repository.save(compra));
    }

    @Transactional
    public CompraResponseDTO atualizar(Long id, CompraRequestDTO dto) {
        var compra = buscarEntidade(id);
        if (!"RASCUNHO".equals(compra.getStatus()))
            throw new RuntimeException("Compra não pode ser editada no status atual");

        var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));

        compra.setNumeroCompra(dto.numeroCompra());
        compra.setDataCompra(dto.dataCompra());
        compra.setObservacao(dto.observacao());
        compra.setFornecedor(fornecedor);
        compra.getItens().clear();

        var itens = dto.itens().stream().map(itemDto -> {
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDto.produtoId()));
            var subtotal = itemDto.quantidade().multiply(itemDto.precoUnitario());
            return CompraItem.builder()
                    .produto(produto)
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(itemDto.precoUnitario())
                    .subtotal(subtotal)
                    .compra(compra)
                    .build();
        }).toList();

        var valorTotal = itens.stream()
                .map(CompraItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        compra.getItens().addAll(itens);
        compra.setValorTotal(valorTotal);

        return CompraResponseDTO.from(repository.save(compra));
    }

    @Transactional
    public CompraResponseDTO validar(Long id) {
        var compra = buscarEntidade(id);
        if (!"RASCUNHO".equals(compra.getStatus()))
            throw new RuntimeException("Compra não pode ser validada no status atual");
        if (compra.getItens().isEmpty())
            throw new RuntimeException("Compra deve ter ao menos um item");
        compra.setStatus("VALIDADA");
        return CompraResponseDTO.from(repository.save(compra));
    }

    @Transactional
    public CompraResponseDTO cancelar(Long id) {
        var compra = buscarEntidade(id);
        if ("NFE_GERADA".equals(compra.getStatus()))
            throw new RuntimeException("Compra com nota fiscal gerada não pode ser cancelada");
        compra.setStatus("CANCELADA");
        return CompraResponseDTO.from(repository.save(compra));
    }

    @Transactional
    public NotaFiscalEntradaResponseDTO gerarNfe(Long id) {
        var compra = buscarEntidade(id);
        if (!"VALIDADA".equals(compra.getStatus()))
            throw new RuntimeException("Nota fiscal só pode ser gerada para compras validadas");
        var nota = notaFiscalEntradaService.criarParaCompra(compra);
        compra.setStatus("NFE_GERADA");
        repository.save(compra);
        return NotaFiscalEntradaResponseDTO.from(nota);
    }

    private Compra buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));
    }
}
