package com.salao.modules.pagamento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CondicaoPagamentoService {

    private final CondicaoPagamentoRepository repository;
    private final FormaPagamentoRepository formaPagamentoRepository;

    public List<CondicaoPagamentoResponseDTO> listar() {
        return repository.findAll().stream().map(CondicaoPagamentoResponseDTO::from).toList();
    }

    public CondicaoPagamentoResponseDTO buscarPorId(Long id) {
        return CondicaoPagamentoResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public CondicaoPagamentoResponseDTO criar(CondicaoPagamentoRequestDTO dto) {
        if (repository.existsByCondicao(dto.condicao()))
            throw new RuntimeException("Condição de pagamento já cadastrada");
        var cp = CondicaoPagamento.builder()
                .condicao(dto.condicao())
                .multa(dto.multa() != null ? dto.multa() : BigDecimal.ZERO)
                .juro(dto.juro() != null ? dto.juro() : BigDecimal.ZERO)
                .desconto(dto.desconto() != null ? dto.desconto() : BigDecimal.ZERO)
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        adicionarParcelas(cp, dto.parcelas());
        return CondicaoPagamentoResponseDTO.from(repository.save(cp));
    }

    @Transactional
    public CondicaoPagamentoResponseDTO atualizar(Long id, CondicaoPagamentoRequestDTO dto) {
        var cp = buscarEntidade(id);
        cp.setCondicao(dto.condicao());
        if (dto.multa() != null) cp.setMulta(dto.multa());
        if (dto.juro() != null) cp.setJuro(dto.juro());
        if (dto.desconto() != null) cp.setDesconto(dto.desconto());
        if (dto.ativo() != null) cp.setAtivo(dto.ativo());
        cp.getParcelas().clear();
        adicionarParcelas(cp, dto.parcelas());
        return CondicaoPagamentoResponseDTO.from(repository.save(cp));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        repository.deleteById(id);
    }

    private void adicionarParcelas(CondicaoPagamento cp, List<ParcelaRequestDTO> dtos) {
        if (dtos == null) return;
        dtos.forEach(p -> {
            var parcela = Parcela.builder()
                    .numeroParcela(p.numeroParcela())
                    .diasVencimento(p.diasVencimento())
                    .ativo(p.ativo() != null ? p.ativo() : true)
                    .formaPagamento(resolveFormaPagamento(p.formaPagamentoId()))
                    .condicaoPagamento(cp)
                    .build();
            cp.getParcelas().add(parcela);
        });
    }

    private FormaPagamento resolveFormaPagamento(Long id) {
        if (id == null) return null;
        return formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada"));
    }

    private CondicaoPagamento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
    }
}
