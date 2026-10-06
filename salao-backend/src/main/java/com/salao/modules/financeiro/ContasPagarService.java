package com.salao.modules.financeiro;

import com.salao.modules.fornecedor.Fornecedor;
import com.salao.modules.fornecedor.FornecedorRepository;
import com.salao.modules.pagamento.Parcela;
import com.salao.modules.pagamento.ParcelaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ContasPagarService {

    private static final LocalDate DATA_MINIMA = LocalDate.of(2000, 1, 1);

    private final ContasPagarRepository repository;
    private final FornecedorRepository fornecedorRepository;
    private final ParcelaRepository parcelaRepository;

    public List<ContasPagarResponseDTO> listar() {
        return repository.findAll().stream().map(ContasPagarResponseDTO::from).toList();
    }

    public ContasPagarResponseDTO buscarPorId(Long id) {
        return ContasPagarResponseDTO.from(buscarEntidade(id));
    }

    public ContasPagarResponseDTO criar(ContasPagarRequestDTO dto) {
        var fornecedor = buscarFornecedorAtivo(dto.fornecedorId());
        validarVencimento(dto.dataVencimento());
        var parcela = dto.parcelaId() != null
                ? parcelaRepository.findById(dto.parcelaId())
                        .orElseThrow(() -> new RuntimeException("Parcela não encontrada"))
                : null;

        var conta = ContasPagar.builder()
                .descricao(dto.descricao())
                .valor(dto.valor())
                .dataVencimento(dto.dataVencimento())
                .situacao("ABERTA")
                .fornecedor(fornecedor)
                .parcela(parcela)
                .build();
        aplicarCondicao(conta, parcela);

        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public ContasPagarResponseDTO atualizar(Long id, ContasPagarRequestDTO dto) {
        var conta = buscarEntidade(id);
        if (!"ABERTA".equals(conta.getSituacao()))
            throw new RuntimeException("Só é possível editar contas em aberto");
        if (conta.veioDeNota())
            throw new RuntimeException("Esta conta foi gerada pela Nota de Entrada " + conta.getNotaNumero() + "/"
                    + conta.getNotaSerie() + " e não pode ser editada: só pode ser paga ou cancelada.");
        var fornecedor = buscarFornecedorAtivo(dto.fornecedorId());
        validarVencimento(dto.dataVencimento());
        var parcela = dto.parcelaId() != null
                ? parcelaRepository.findById(dto.parcelaId())
                        .orElseThrow(() -> new RuntimeException("Parcela não encontrada"))
                : null;

        Long parcelaAnterior = conta.getParcela() != null ? conta.getParcela().getId() : null;
        if (!Objects.equals(parcelaAnterior, dto.parcelaId()))
            aplicarCondicao(conta, parcela);

        conta.setDescricao(dto.descricao());
        conta.setValor(dto.valor());
        conta.setDataVencimento(dto.dataVencimento());
        conta.setFornecedor(fornecedor);
        conta.setParcela(parcela);

        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public CalculoBaixa calcularPagamento(Long id, LocalDate data) {
        var conta = buscarEntidade(id);
        return calcular(conta, validarDataPagamento(data));
    }

    public ContasPagarResponseDTO pagar(Long id, LocalDate data) {
        var conta = buscarEntidade(id);
        if ("CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível pagar uma conta cancelada");
        if ("PAGA".equals(conta.getSituacao()))
            throw new RuntimeException("Esta conta já foi paga");

        var calculo = calcular(conta, validarDataPagamento(data));
        conta.setValorDesconto(calculo.valorDesconto());
        conta.setValorMulta(calculo.valorMulta());
        conta.setValorJuro(calculo.valorJuro());
        conta.setValorPago(calculo.valorFinal());
        conta.setDataPagamento(calculo.dataBaixa());
        conta.setSituacao("PAGA");
        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public ContasPagarResponseDTO cancelar(Long id) {
        var conta = buscarEntidade(id);
        if ("PAGA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível cancelar uma conta já paga");
        conta.setSituacao("CANCELADA");
        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public void deletar(Long id) {
        var conta = buscarEntidade(id);
        if (!"CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Só é possível excluir contas com situação CANCELADA");
        if (conta.veioDeNota())
            throw new RuntimeException("Contas geradas por uma Nota de Entrada não podem ser excluídas (ficam canceladas, como histórico da nota).");
        repository.deleteById(id);
    }

    private CalculoBaixa calcular(ContasPagar conta, LocalDate data) {
        return CalculoBaixa.calcular(conta.getValor(), conta.getDataVencimento(), data,
                conta.getPercentualDesconto(), conta.getPercentualMulta(), conta.getPercentualJuro());
    }

    private LocalDate validarDataPagamento(LocalDate data) {
        var dataPagamento = data != null ? data : LocalDate.now();
        if (dataPagamento.isAfter(LocalDate.now()))
            throw new RuntimeException("Data de pagamento não pode ser futura");
        if (dataPagamento.isBefore(DATA_MINIMA))
            throw new RuntimeException("Data de pagamento inválida.");
        return dataPagamento;
    }

    // Vencimento dentro de uma janela razoável: evita ano digitado errado (0202, 2062...)
    private void validarVencimento(LocalDate vencimento) {
        if (vencimento.isBefore(DATA_MINIMA) || vencimento.isAfter(LocalDate.now().plusYears(10)))
            throw new RuntimeException("Data de vencimento inválida (deve estar entre 2000 e " + LocalDate.now().plusYears(10).getYear() + ").");
    }

    private Fornecedor buscarFornecedorAtivo(Long id) {
        var fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        if (!Boolean.TRUE.equals(fornecedor.getAtivo()))
            throw new RuntimeException("Fornecedor inativo.");
        return fornecedor;
    }

    // Copia os termos da condição da parcela; alterar a condição depois não mexe nas contas já lançadas
    private void aplicarCondicao(ContasPagar conta, Parcela parcela) {
        var condicao = parcela != null ? parcela.getCondicaoPagamento() : null;
        conta.setPercentualDesconto(condicao != null ? condicao.getDesconto() : BigDecimal.ZERO);
        conta.setPercentualMulta(condicao != null ? condicao.getMulta() : BigDecimal.ZERO);
        conta.setPercentualJuro(condicao != null ? condicao.getJuro() : BigDecimal.ZERO);
    }

    private ContasPagar buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a pagar não encontrada"));
    }
}
