package com.salao.modules.pagamento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CondicaoPagamentoService {

    private final CondicaoPagamentoRepository repository;
    private final ParcelaRepository parcelaRepository;

    public List<CondicaoPagamentoResponseDTO> listar() {
        return repository.findAll().stream().map(CondicaoPagamentoResponseDTO::from).toList();
    }

    public CondicaoPagamentoResponseDTO buscarPorId(Long id) {
        return CondicaoPagamentoResponseDTO.from(buscarEntidade(id));
    }

    public CondicaoPagamentoResponseDTO criar(CondicaoPagamentoRequestDTO dto) {
        if (repository.existsByCondicao(dto.condicao()))
            throw new RuntimeException("Condição de pagamento já cadastrada");
        var cp = CondicaoPagamento.builder()
                .condicao(dto.condicao())
                .multa(dto.multa() != null ? dto.multa() : BigDecimal.ZERO)
                .desconto(dto.desconto() != null ? dto.desconto() : BigDecimal.ZERO)
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return CondicaoPagamentoResponseDTO.from(repository.save(cp));
    }

    public CondicaoPagamentoResponseDTO atualizar(Long id, CondicaoPagamentoRequestDTO dto) {
        var cp = buscarEntidade(id);
        cp.setCondicao(dto.condicao());
        if (dto.multa() != null) cp.setMulta(dto.multa());
        if (dto.desconto() != null) cp.setDesconto(dto.desconto());
        if (dto.ativo() != null) cp.setAtivo(dto.ativo());
        return CondicaoPagamentoResponseDTO.from(repository.save(cp));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (parcelaRepository.existsByCondicaoPagamentoId(id))
            throw new RuntimeException("Não é possível excluir: existem parcelas vinculadas a esta condição de pagamento");
        repository.deleteById(id);
    }

    private CondicaoPagamento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
    }
}
