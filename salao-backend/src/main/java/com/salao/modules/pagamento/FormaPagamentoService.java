package com.salao.modules.pagamento;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FormaPagamentoService {

    private final FormaPagamentoRepository repository;
    private final ParcelaRepository parcelaRepository;

    public List<FormaPagamentoResponseDTO> listar() {
        return repository.findAll().stream().map(FormaPagamentoResponseDTO::from).toList();
    }

    public FormaPagamentoResponseDTO buscarPorId(Long id) {
        return FormaPagamentoResponseDTO.from(buscarEntidade(id));
    }

    public FormaPagamentoResponseDTO criar(FormaPagamentoRequestDTO dto) {
        if (repository.existsByFormaPagamento(dto.formaPagamento()))
            throw new RuntimeException("Forma de pagamento já cadastrada");
        var fp = FormaPagamento.builder()
                .formaPagamento(dto.formaPagamento())
                .percentual(dto.percentual() != null ? dto.percentual() : BigDecimal.ZERO)
                .numeroDias(dto.numeroDias() != null ? dto.numeroDias() : 0)
                .ativo(dto.ativo() != null ? dto.ativo() : true)
                .build();
        return FormaPagamentoResponseDTO.from(repository.save(fp));
    }

    public FormaPagamentoResponseDTO atualizar(Long id, FormaPagamentoRequestDTO dto) {
        var fp = buscarEntidade(id);
        fp.setFormaPagamento(dto.formaPagamento());
        if (dto.percentual() != null) fp.setPercentual(dto.percentual());
        if (dto.numeroDias() != null) fp.setNumeroDias(dto.numeroDias());
        if (dto.ativo() != null) fp.setAtivo(dto.ativo());
        return FormaPagamentoResponseDTO.from(repository.save(fp));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (parcelaRepository.existsByFormaPagamentoId(id))
            throw new RuntimeException("Não é possível excluir: existem parcelas vinculadas a esta forma de pagamento");
        repository.deleteById(id);
    }

    private FormaPagamento buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Forma de pagamento não encontrada"));
    }
}
