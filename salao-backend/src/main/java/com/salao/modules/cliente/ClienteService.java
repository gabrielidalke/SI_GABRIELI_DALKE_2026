package com.salao.modules.cliente;

import com.salao.modules.geo.cidade.Cidade;
import com.salao.modules.geo.cidade.CidadeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;
    private final CidadeRepository cidadeRepository;

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

        Cidade cidade = null;
        if (dto.cidadeId() != null) {
            cidade = cidadeRepository.findById(dto.cidadeId()).orElse(null);
        }

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
                .cidade(cidade)
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

        if (dto.cidadeId() != null) {
            cidadeRepository.findById(dto.cidadeId()).ifPresent(c::setCidade);
        } else {
            c.setCidade(null);
        }

        return repository.save(c);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}