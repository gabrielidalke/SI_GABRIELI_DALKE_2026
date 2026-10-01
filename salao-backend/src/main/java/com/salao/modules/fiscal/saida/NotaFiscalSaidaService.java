package com.salao.modules.fiscal.saida;

import com.salao.modules.estoque.MovimentacaoEstoqueService;
import com.salao.modules.financeiro.ContasReceber;
import com.salao.modules.financeiro.ContasReceberRepository;
import com.salao.modules.pagamento.Parcela;
import com.salao.modules.venda.Venda;
import com.salao.modules.venda.VendaItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalSaidaService {

    private final NotaFiscalSaidaRepository repository;
    private final ContasReceberRepository contasReceberRepository;
    private final MovimentacaoEstoqueService movimentacaoEstoqueService;

    public List<NotaFiscalSaidaResponseDTO> listar() {
        return repository.findAll().stream().map(NotaFiscalSaidaResponseDTO::from).toList();
    }

    public NotaFiscalSaidaResponseDTO buscarPorId(Long id) {
        return NotaFiscalSaidaResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public NotaFiscalSaida criarParaVenda(Venda venda) {
        var nota = repository.save(NotaFiscalSaida.builder()
                .venda(venda)
                .cliente(venda.getCliente())
                .valorTotal(venda.getValorTotal())
                .serie("1")
                .build());
        nota.setNumeroNota("NFS-" + String.format("%06d", nota.getId()));
        nota = repository.save(nota);

        for (VendaItem item : venda.getItens()) {
            movimentacaoEstoqueService.registrarSaida(item.getProduto(), item.getQuantidade(), "VENDA", venda.getId());
        }

        gerarContasReceber(venda, nota);

        return nota;
    }

    private void gerarContasReceber(Venda venda, NotaFiscalSaida nota) {
        var condicao = venda.getCondicaoPagamento();
        List<Parcela> parcelas = condicao != null ? condicao.getParcelas() : null;
        // Termos copiados para cada conta; valem na baixa (desconto até o vencimento, multa/juro depois)
        BigDecimal desconto = condicao != null ? condicao.getDesconto() : BigDecimal.ZERO;
        BigDecimal multa = condicao != null ? condicao.getMulta() : BigDecimal.ZERO;
        BigDecimal juro = condicao != null ? condicao.getJuro() : BigDecimal.ZERO;

        if (parcelas == null || parcelas.isEmpty()) {
            contasReceberRepository.save(ContasReceber.builder()
                    .descricao("Venda " + venda.getNumeroVenda() + " - NF " + nota.getNumeroNota())
                    .valor(venda.getValorTotal())
                    .dataVencimento(venda.getDataVenda())
                    .cliente(venda.getCliente())
                    .notaFiscalSaida(nota)
                    .percentualDesconto(desconto)
                    .percentualMulta(multa)
                    .percentualJuro(juro)
                    .build());
            return;
        }

        var ordenadas = parcelas.stream()
                .sorted(Comparator.comparing(p -> p.getNumeroParcela() != null ? p.getNumeroParcela() : 0))
                .toList();

        BigDecimal total = venda.getValorTotal();
        BigDecimal acumulado = BigDecimal.ZERO;
        int totalParcelas = ordenadas.size();

        for (int i = 0; i < totalParcelas; i++) {
            var parcela = ordenadas.get(i);
            BigDecimal valorParcela;
            if (i == totalParcelas - 1) {
                valorParcela = total.subtract(acumulado);
            } else {
                valorParcela = total.multiply(parcela.getPercentual())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                acumulado = acumulado.add(valorParcela);
            }
            int dias = parcela.getDiasVencimento() != null ? parcela.getDiasVencimento() : 0;

            contasReceberRepository.save(ContasReceber.builder()
                    .descricao("Venda " + venda.getNumeroVenda() + " - NF " + nota.getNumeroNota()
                            + " - Parcela " + (i + 1) + "/" + totalParcelas)
                    .valor(valorParcela)
                    .dataVencimento(venda.getDataVenda().plusDays(dias))
                    .cliente(venda.getCliente())
                    .parcela(parcela)
                    .notaFiscalSaida(nota)
                    .percentualDesconto(desconto)
                    .percentualMulta(multa)
                    .percentualJuro(juro)
                    .build());
        }
    }

    public NotaFiscalSaidaResponseDTO atualizarTransporte(Long id, TransporteRequestDTO dto) {
        var nota = buscarEntidade(id);
        nota.setTransportadoraNome(dto.transportadoraNome());
        nota.setVeiculoPlaca(dto.veiculoPlaca());
        return NotaFiscalSaidaResponseDTO.from(repository.save(nota));
    }

    private NotaFiscalSaida buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota fiscal de saída não encontrada"));
    }
}
