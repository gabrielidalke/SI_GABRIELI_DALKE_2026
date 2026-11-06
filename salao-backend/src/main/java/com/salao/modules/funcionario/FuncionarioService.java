package com.salao.modules.funcionario;

import com.salao.modules.funcao.FuncaoService;
import com.salao.modules.geo.cidade.CidadeRepository;
import com.salao.util.TipoPessoa;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final FuncaoService funcaoService;
    private final CidadeRepository cidadeRepository;

    public List<Funcionario> listar() {
        return repository.findAll();
    }

    public Funcionario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
    }

    public Funcionario salvar(FuncionarioDTO dto) {
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.FISICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpj(documento))
            throw new RuntimeException("CPF/CNPJ já cadastrado");
        validarDatas(dto.dataNascimento(), dto.dataAdmissao(), dto.dataDemissao());

        var f = new Funcionario();
        f.setAtivo(true);
        preencher(f, dto, tipo, documento);
        return repository.save(f);
    }

    public Funcionario atualizar(Long id, FuncionarioDTO dto) {
        Funcionario f = buscarPorId(id);
        String tipo = TipoPessoa.normalizar(dto.tipoPessoa(), TipoPessoa.FISICA, dto.cpfCnpj());
        String documento = TipoPessoa.documento(tipo, dto.cpfCnpj());
        if (documento != null && repository.existsByCpfCnpjAndIdNot(documento, id))
            throw new RuntimeException("CPF/CNPJ já cadastrado");
        validarDatas(dto.dataNascimento(), dto.dataAdmissao(), dto.dataDemissao());

        preencher(f, dto, tipo, documento);
        if (dto.ativo() != null) f.setAtivo(dto.ativo());
        return repository.save(f);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }

    private void preencher(Funcionario f, FuncionarioDTO dto, String tipo, String documento) {
        var funcao = funcaoService.buscarAtiva(dto.funcaoId());
        f.setTipoPessoa(tipo);
        f.setNome(dto.nome());
        f.setApelido(dto.apelido());
        f.setEmail(dto.email());
        f.setTelefone(dto.telefone());
        f.setCpfCnpj(documento);
        // RG para pessoa física; Inscrição Estadual para jurídica
        f.setRg(TipoPessoa.soSeFisica(tipo, dto.rg()));
        f.setInscricaoEstadual(TipoPessoa.soSeJuridica(tipo, dto.inscricaoEstadual()));
        f.setFuncao(funcao);
        f.setDataNascimento(dto.dataNascimento());
        f.setDataAdmissao(dto.dataAdmissao());
        f.setDataDemissao(dto.dataDemissao());
        f.setSexo(dto.sexo());
        f.setEstadoCivil(dto.estadoCivil());
        f.setEndereco(dto.endereco());
        f.setNumero(dto.numero());
        f.setComplemento(dto.complemento());
        f.setBairro(dto.bairro());
        f.setCep(dto.cep());
        // a cidade vinha da tela mas não era gravada
        f.setCidade(dto.cidadeId() != null
                ? cidadeRepository.findById(dto.cidadeId()).orElseThrow(() -> new RuntimeException("Cidade não encontrada"))
                : null);
        // sem salário informado, vale o salário base da função
        f.setSalario(dto.salario() != null ? dto.salario() : funcao.getSalarioBase());
        f.setPercentualComissao(dto.percentualComissao() != null ? dto.percentualComissao() : BigDecimal.ZERO);
        f.setObservacao(dto.observacao());
    }

    private void validarDatas(java.time.LocalDate nascimento, java.time.LocalDate admissao, java.time.LocalDate demissao) {
        // CLT: idade mínima para trabalhar é 16 anos (fora jovem aprendiz)
        if (nascimento != null && admissao != null && nascimento.plusYears(16).isAfter(admissao))
            throw new RuntimeException("Funcionário precisa ter pelo menos 16 anos na data de admissão.");
        if (demissao != null && admissao != null && demissao.isBefore(admissao))
            throw new RuntimeException("Data de demissão não pode ser anterior à data de admissão.");
    }
}
