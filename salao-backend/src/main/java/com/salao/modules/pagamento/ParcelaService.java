package com.salao.modules.pagamento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParcelaService {

    private final ParcelaRepository repository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;

    public List<ParcelaResponseDTO> listar() {
        return repository.findAll().stream().map(ParcelaResponseDTO::from).toList();
    }

    public ParcelaResponseDTO buscarPorId(Long id) {
        return ParcelaResponseDTO.from(buscarEntidade(id));
    }

    public ParcelaResponseDTO criar(ParcelaRequestDTO dto) {
        var parcela = Parcela.builder()
                .numeroDias(dto.numeroDias())
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .formaPagamento(resolveFormaPagamento(dto.formaPagamentoId()))
                .condicaoPagamento(resolveCondicaoPagamento(dto.condicaoPagamentoId()))
                .build();
        return ParcelaResponseDTO.from(repository.save(parcela));
    }

    public ParcelaResponseDTO atualizar(Long id, ParcelaRequestDTO dto) {
        var parcela = buscarEntidade(id);
        parcela.setNumeroDias(dto.numeroDias());
        if (dto.ativo() != null) parcela.setAtivo(dto.ativo());
        parcela.setFormaPagamento(resolveFormaPagamento(dto.formaPagamentoId()));
        parcela.setCondicaoPagamento(resolveCondicaoPagamento(dto.condicaoPagamentoId()));
        return ParcelaResponseDTO.from(repository.save(parcela));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        repository.deleteById(id);
    }

    private FormaPagamento resolveFormaPagamento(Long id) {
        if (id == null) return null;
        return formaPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada"));
    }

    private CondicaoPagamento resolveCondicaoPagamento(Long id) {
        if (id == null) return null;
        return condicaoPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
    }

    private Parcela buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parcela não encontrada"));
    }
}
