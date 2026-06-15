package com.salao.modules.fiscal.saida;

import com.salao.modules.fiscal.entrada.TransporteRequestDTO;
import com.salao.modules.venda.Venda;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalSaidaService {

    private final NotaFiscalSaidaRepository repository;

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
        return repository.save(nota);
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
