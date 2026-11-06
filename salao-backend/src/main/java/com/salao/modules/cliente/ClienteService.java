package com.salao.modules.cliente;

import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.modules.pagamento.CondicaoPagamento;
import com.salao.modules.pagamento.CondicaoPagamentoRepository;
import com.salao.util.TipoPessoa;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;
    private final CidadeRepository cidadeRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;

    public List<Cliente> listar() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    public Cliente salvar(ClienteDTO dto) {
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.FISICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpj(documento))
            throw new RuntimeException("CPF/CNPJ já cadastrado");

        var c = new Cliente();
        c.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        preencher(c, dto, tipo, documento);
        return repository.save(c);
    }

    public Cliente atualizar(Long id, ClienteDTO dto) {
        Cliente c = buscarPorId(id);
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.FISICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpjAndIdNot(documento, id))
            throw new RuntimeException("CPF/CNPJ já cadastrado");

        preencher(c, dto, tipo, documento);
        if (dto.ativo() != null) c.setAtivo(dto.ativo());
        return repository.save(c);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private void preencher(Cliente c, ClienteDTO dto, String tipo, String documento) {
        c.setTipoPessoa(tipo);
        c.setNome(dto.nome());
        c.setApelido(dto.apelido());
        c.setEmail(dto.email());
        c.setTelefone(dto.telefone());
        c.setEndereco(dto.endereco());
        c.setNumero(dto.numero());
        c.setComplemento(dto.complemento());
        c.setBairro(dto.bairro());
        c.setCep(dto.cep());
        c.setCpfCnpj(documento);
        // RG para pessoa física; Inscrição Estadual para jurídica
        c.setRg(TipoPessoa.soSeFisica(tipo, dto.rg()));
        c.setInscricaoEstadual(TipoPessoa.soSeJuridica(tipo, dto.inscricaoEstadual()));
        c.setDataNascimento(dto.dataNascimento());
        c.setSexo(dto.sexo());
        c.setEstadoCivil(dto.estadoCivil());
        c.setObservacao(dto.observacao());
        c.setCidade(dto.cidadeId() != null
                ? cidadeRepository.findById(dto.cidadeId()).orElseThrow(() -> new RuntimeException("Cidade não encontrada"))
                : null);
        c.setCondicaoPagamento(condicaoAtiva(dto.condicaoPagamentoId()));
        c.setLimiteCredito(dto.limiteCredito() != null ? dto.limiteCredito() : BigDecimal.ZERO);
    }

    private CondicaoPagamento condicaoAtiva(Long id) {
        var condicao = condicaoPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
        if (Boolean.FALSE.equals(condicao.getAtivo()))
            throw new RuntimeException("Condição de pagamento inativa: " + condicao.getCondicao());
        return condicao;
    }
}
