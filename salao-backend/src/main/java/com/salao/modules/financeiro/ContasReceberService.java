package com.salao.modules.financeiro;

import com.salao.modules.cliente.ClienteRepository;
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
public class ContasReceberService {

    private final ContasReceberRepository repository;
    private final ClienteRepository clienteRepository;
    private final ParcelaRepository parcelaRepository;

    public List<ContasReceberResponseDTO> listar() {
        return repository.findAll().stream().map(ContasReceberResponseDTO::from).toList();
    }

    public ContasReceberResponseDTO buscarPorId(Long id) {
        return ContasReceberResponseDTO.from(buscarEntidade(id));
    }

    public ContasReceberResponseDTO criar(ContasReceberRequestDTO dto) {
        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        var parcela = dto.parcelaId() != null
                ? parcelaRepository.findById(dto.parcelaId())
                        .orElseThrow(() -> new RuntimeException("Parcela não encontrada"))
                : null;

        var conta = ContasReceber.builder()
                .descricao(dto.descricao())
                .valor(dto.valor())
                .dataVencimento(dto.dataVencimento())
                .situacao("ABERTA")
                .cliente(cliente)
                .parcela(parcela)
                .build();
        aplicarCondicao(conta, parcela);

        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public ContasReceberResponseDTO atualizar(Long id, ContasReceberRequestDTO dto) {
        var conta = buscarEntidade(id);
        if (!"ABERTA".equals(conta.getSituacao()))
            throw new RuntimeException("Só é possível editar contas em aberto");
        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
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
        conta.setCliente(cliente);
        conta.setParcela(parcela);

        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public CalculoBaixa calcularRecebimento(Long id, LocalDate data) {
        var conta = buscarEntidade(id);
        return calcular(conta, validarDataRecebimento(data));
    }

    public ContasReceberResponseDTO receber(Long id, LocalDate data) {
        var conta = buscarEntidade(id);
        if ("CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível receber uma conta cancelada");
        if ("RECEBIDA".equals(conta.getSituacao()))
            throw new RuntimeException("Esta conta já foi recebida");

        var calculo = calcular(conta, validarDataRecebimento(data));
        conta.setValorDesconto(calculo.valorDesconto());
        conta.setValorMulta(calculo.valorMulta());
        conta.setValorJuro(calculo.valorJuro());
        conta.setValorRecebido(calculo.valorFinal());
        conta.setDataRecebimento(calculo.dataBaixa());
        conta.setSituacao("RECEBIDA");
        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public ContasReceberResponseDTO cancelar(Long id) {
        var conta = buscarEntidade(id);
        if ("RECEBIDA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível cancelar uma conta já recebida");
        conta.setSituacao("CANCELADA");
        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public void deletar(Long id) {
        var conta = buscarEntidade(id);
        if (!"CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Só é possível excluir contas com situação CANCELADA");
        repository.deleteById(id);
    }

    private CalculoBaixa calcular(ContasReceber conta, LocalDate data) {
        return CalculoBaixa.calcular(conta.getValor(), conta.getDataVencimento(), data,
                conta.getPercentualDesconto(), conta.getPercentualMulta(), conta.getPercentualJuro());
    }

    private LocalDate validarDataRecebimento(LocalDate data) {
        var dataRecebimento = data != null ? data : LocalDate.now();
        if (dataRecebimento.isAfter(LocalDate.now()))
            throw new RuntimeException("Data de recebimento não pode ser futura");
        return dataRecebimento;
    }

    // Copia os termos da condição da parcela; alterar a condição depois não mexe nas contas já lançadas
    private void aplicarCondicao(ContasReceber conta, Parcela parcela) {
        var condicao = parcela != null ? parcela.getCondicaoPagamento() : null;
        conta.setPercentualDesconto(condicao != null ? condicao.getDesconto() : BigDecimal.ZERO);
        conta.setPercentualMulta(condicao != null ? condicao.getMulta() : BigDecimal.ZERO);
        conta.setPercentualJuro(condicao != null ? condicao.getJuro() : BigDecimal.ZERO);
    }

    private ContasReceber buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a receber não encontrada"));
    }
}
