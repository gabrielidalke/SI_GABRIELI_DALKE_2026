package com.salao.modules.financeiro;

import com.salao.modules.cliente.ClienteRepository;
import com.salao.modules.pagamento.ParcelaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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

        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public ContasReceberResponseDTO atualizar(Long id, ContasReceberRequestDTO dto) {
        var conta = buscarEntidade(id);
        var cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
        var parcela = dto.parcelaId() != null
                ? parcelaRepository.findById(dto.parcelaId())
                        .orElseThrow(() -> new RuntimeException("Parcela não encontrada"))
                : null;

        conta.setDescricao(dto.descricao());
        conta.setValor(dto.valor());
        conta.setDataVencimento(dto.dataVencimento());
        conta.setCliente(cliente);
        conta.setParcela(parcela);

        return ContasReceberResponseDTO.from(repository.save(conta));
    }

    public ContasReceberResponseDTO receber(Long id) {
        var conta = buscarEntidade(id);
        if ("CANCELADA".equals(conta.getSituacao()))
            throw new RuntimeException("Não é possível receber uma conta cancelada");
        conta.setSituacao("RECEBIDA");
        conta.setDataRecebimento(LocalDate.now());
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

    private ContasReceber buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conta a receber não encontrada"));
    }
}
