package com.salao.modules.financeiro;

import com.salao.modules.fornecedor.FornecedorRepository;
import com.salao.modules.pagamento.ParcelaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContasPagarService {

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
        var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
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

        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public ContasPagarResponseDTO atualizar(Long id, ContasPagarRequestDTO dto) {
        var conta = buscarEntidade(id);
        var fornecedor = fornecedorRepository.findById(dto.fornecedorId())
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
        var parcela = dto.parcelaId() != null
                ? parcelaRepository.findById(dto.parcelaId())
                        .orElseThrow(() -> new RuntimeException("Parcela não encontrada"))
                : null;

        conta.setDescricao(dto.descricao());
        conta.setValor(dto.valor());
        conta.setDataVencimento(dto.dataVencimento());
        conta.setFornecedor(fornecedor);
        conta.setParcela(parcela);

        return ContasPagarResponseDTO.from(repository.save(conta));
    }

    public ContasPagarResponseDTO pagar(Long id) {
        var conta = buscarEntidade(id);
        if ("CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível pagar uma conta cancelada");
        conta.setSituacao("PAGA");
        conta.setDataPagamento(LocalDate.now());
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
        repository.deleteById(id);
    }

    private ContasPagar buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a pagar não encontrada"));
    }
}
