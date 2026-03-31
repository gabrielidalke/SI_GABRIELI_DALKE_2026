package com.salao.modules.cliente;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public List<Cliente> listar() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    public Cliente salvar(ClienteDTO dto) {
        if (dto.cpf() != null && !dto.cpf().isBlank() && repository.existsByCpf(dto.cpf()))
            throw new RuntimeException("CPF já cadastrado");
        return repository.save(Cliente.builder()
                .nome(dto.nome())
                .apelido(dto.apelido())
                .email(dto.email())
                .telefone(dto.telefone())
                .endereco(dto.endereco())
                .numero(dto.numero())
                .complemento(dto.complemento())
                .bairro(dto.bairro())
                .cep(dto.cep())
                .cpf(dto.cpf())
                .rg(dto.rg())
                .dataNascimento(dto.dataNascimento())
                .sexo(dto.sexo())
                .estadoCivil(dto.estadoCivil())
                .observacao(dto.observacao())
                .build());
    }

    public Cliente atualizar(Long id, ClienteDTO dto) {
        Cliente c = buscarPorId(id);
        c.setNome(dto.nome());
        c.setApelido(dto.apelido());
        c.setEmail(dto.email());
        c.setTelefone(dto.telefone());
        c.setEndereco(dto.endereco());
        c.setNumero(dto.numero());
        c.setComplemento(dto.complemento());
        c.setBairro(dto.bairro());
        c.setCep(dto.cep());
        c.setCpf(dto.cpf());
        c.setRg(dto.rg());
        c.setDataNascimento(dto.dataNascimento());
        c.setSexo(dto.sexo());
        c.setEstadoCivil(dto.estadoCivil());
        c.setObservacao(dto.observacao());
        c.setAtivo(dto.ativo());
        return repository.save(c);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
