package com.salao.modules.funcionario;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public List<Funcionario> listar() {
        return repository.findAll();
    }

    public Funcionario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));
    }

    public Funcionario salvar(FuncionarioDTO dto) {
        if (dto.cpf() != null && !dto.cpf().isBlank() && repository.existsByCpf(dto.cpf()))
            throw new RuntimeException("CPF já cadastrado");
        return repository.save(Funcionario.builder()
                .nome(dto.nome())
                .apelido(dto.apelido())
                .email(dto.email())
                .telefone(dto.telefone())
                .cpf(dto.cpf())
                .dataNascimento(dto.dataNascimento())
                .dataAdmissao(dto.dataAdmissao())
                .sexo(dto.sexo())
                .estadoCivil(dto.estadoCivil())
                .endereco(dto.endereco())
                .numero(dto.numero())
                .complemento(dto.complemento())
                .bairro(dto.bairro())
                .cep(dto.cep())
                .salario(dto.salario())
                .percentualComissao(dto.percentualComissao() != null ? dto.percentualComissao() : BigDecimal.ZERO)
                .observacao(dto.observacao())
                .build());
    }

    public Funcionario atualizar(Long id, FuncionarioDTO dto) {
        Funcionario f = buscarPorId(id);
        f.setNome(dto.nome());
        f.setApelido(dto.apelido());
        f.setEmail(dto.email());
        f.setTelefone(dto.telefone());
        f.setCpf(dto.cpf());
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
        f.setSalario(dto.salario());
        f.setPercentualComissao(dto.percentualComissao());
        f.setObservacao(dto.observacao());
        f.setAtivo(dto.ativo());
        return repository.save(f);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}