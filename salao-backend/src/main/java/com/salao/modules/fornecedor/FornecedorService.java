package com.salao.modules.fornecedor;

import com.salao.modules.financeiro.ContasPagarRepository;
import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.modules.notaentrada.NotaEntradaRepository;
import com.salao.modules.pagamento.CondicaoPagamento;
import com.salao.modules.pagamento.CondicaoPagamentoRepository;
import com.salao.modules.pedidocompra.PedidoCompraRepository;
import com.salao.util.TipoPessoa;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FornecedorService {

    private final FornecedorRepository repository;
    private final ContasPagarRepository contasPagarRepository;
    private final CidadeRepository cidadeRepository;
    private final CondicaoPagamentoRepository condicaoPagamentoRepository;
    private final NotaEntradaRepository notaEntradaRepository;
    private final PedidoCompraRepository pedidoCompraRepository;

    public List<FornecedorResponseDTO> listar() {
        return repository.findAll().stream().map(FornecedorResponseDTO::from).toList();
    }

    public FornecedorResponseDTO buscarPorId(Long id) {
        return FornecedorResponseDTO.from(buscarEntidade(id));
    }

    public FornecedorResponseDTO criar(FornecedorRequestDTO dto) {
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.JURIDICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpj(documento))
            throw new RuntimeException("Já existe um fornecedor cadastrado com este CPF/CNPJ.");

        var fornecedor = new Fornecedor();
        fornecedor.setAtivo(dto.ativo() != null ? dto.ativo() : true);
        preencher(fornecedor, dto, tipo, documento);
        return FornecedorResponseDTO.from(repository.save(fornecedor));
    }

    public FornecedorResponseDTO atualizar(Long id, FornecedorRequestDTO dto) {
        var fornecedor = buscarEntidade(id);
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.JURIDICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpjAndIdNot(documento, id))
            throw new RuntimeException("Já existe um fornecedor cadastrado com este CPF/CNPJ.");

        if (dto.ativo() != null) fornecedor.setAtivo(dto.ativo());
        preencher(fornecedor, dto, tipo, documento);
        return FornecedorResponseDTO.from(repository.save(fornecedor));
    }

    // Todos os campos da tela são gravados (antes vários se perdiam ao salvar)
    private void preencher(Fornecedor f, FornecedorRequestDTO dto, String tipo, String documento) {
        f.setTipoPessoa(tipo);
        f.setFornecedor(dto.fornecedor().trim());
        f.setNomeFantasia(vazioParaNulo(dto.nomeFantasia()));
        f.setCpfCnpj(documento);
        // RG para pessoa física; inscrições (estadual e do substituto tributário) para jurídica
        f.setRg(TipoPessoa.soSeFisica(tipo, dto.rg()));
        f.setInscricaoEstadual(TipoPessoa.soSeJuridica(tipo, dto.inscricaoEstadual()));
        f.setInscEstSubstTrib(TipoPessoa.soSeJuridica(tipo, dto.inscEstSubstTrib()));
        f.setInscricaoMunicipal(vazioParaNulo(dto.inscricaoMunicipal()));
        f.setEndereco(vazioParaNulo(dto.endereco()));
        f.setNumero(vazioParaNulo(dto.numero()));
        f.setComplemento(vazioParaNulo(dto.complemento()));
        f.setBairro(vazioParaNulo(dto.bairro()));
        f.setCep(dto.cep());
        f.setFone(vazioParaNulo(dto.fone()));
        f.setCelular(vazioParaNulo(dto.celular()));
        f.setEmail(vazioParaNulo(dto.email()));
        f.setContato(vazioParaNulo(dto.contato()));
        f.setSite(vazioParaNulo(dto.site()));
        f.setObservacao(vazioParaNulo(dto.observacao()));
        f.setCidade(dto.cidadeId() != null
                ? cidadeRepository.findById(dto.cidadeId()).orElseThrow(() -> new RuntimeException("Cidade não encontrada"))
                : null);
        f.setCondicaoPagamento(resolveCondicaoPagamento(dto.condicaoPagamentoId()));
    }

    public void deletar(Long id) {
        buscarEntidade(id);
        if (!contasPagarRepository.findByFornecedorId(id).isEmpty()) {
            throw new RuntimeException("Fornecedor possui contas a pagar vinculadas e não pode ser excluído");
        }
        if (notaEntradaRepository.existsByIdFornecedorId(id))
            throw new RuntimeException("Fornecedor possui notas de entrada vinculadas e não pode ser excluído");
        if (pedidoCompraRepository.existsByIdFornecedorId(id))
            throw new RuntimeException("Fornecedor possui pedidos de compra vinculados e não pode ser excluído");
        repository.deleteById(id);
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private CondicaoPagamento resolveCondicaoPagamento(Long id) {
        if (id == null) return null;
        return condicaoPagamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Condição de pagamento não encontrada"));
    }

    private Fornecedor buscarEntidade(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado"));
    }
}
