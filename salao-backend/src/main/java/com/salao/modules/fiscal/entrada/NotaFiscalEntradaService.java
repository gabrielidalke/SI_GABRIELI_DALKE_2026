package com.salao.modules.fiscal.entrada;

import com.salao.modules.compra.Compra;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalEntradaService {

    private final NotaFiscalEntradaRepository repository;

    public List<NotaFiscalEntradaResponseDTO> listar() {
        return repository.findAll().stream().map(NotaFiscalEntradaResponseDTO::from).toList();
    }

    public NotaFiscalEntradaResponseDTO buscarPorId(Long id) {
        return NotaFiscalEntradaResponseDTO.from(buscarEntidade(id));
    }

    @Transactional
    public NotaFiscalEntrada criarParaCompra(Compra compra) {
        var nota = repository.save(NotaFiscalEntrada.builder()
                .compra(compra)
                .fornecedor(compra.getFornecedor())
                .valorTotal(compra.getValorTotal())
                .serie("1")
                .build());
        nota.setNumeroNota("NFE-" + String.format("%06d", nota.getId()));
        return repository.save(nota);
    }

    public NotaFiscalEntradaResponseDTO atualizarDadosTransporte(Long id, String transportadoraNome, String veiculoPlaca) {
        var nota = buscarEntidade(id);
        nota.setTransportadoraNome(transportadoraNome);
        nota.setVeiculoPlaca(veiculoPlaca);
        return NotaFiscalEntradaResponseDTO.from(repository.save(nota));
    }

    private NotaFiscalEntrada buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nota fiscal de entrada não encontrada"));
    }
}
