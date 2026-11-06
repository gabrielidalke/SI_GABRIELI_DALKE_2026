package com.salao;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cadastros no padrão do projeto de referência (30/10/2026): pessoa física/jurídica, campos completos de
 * fornecedor/transportadora/cliente, funções do funcionário, DDI, DDD, alíquotas do NCM e pesos do produto.
 *
 * Roda contra o banco DESCARTÁVEL salao_scratch (veja NotaEntradaFluxoTest):
 *   ./mvnw test -Dtest=CadastrosPadraoTest -Dsalao.integracao=true
 */
@EnabledIfSystemProperty(named = "salao.integracao", matches = "true")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/salao_scratch",
        "spring.flyway.enabled=false",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class CadastrosPadraoTest {

    // documentos válidos (dígitos verificadores corretos)
    private static final String CNPJ = "11222333000181";
    private static final String CPF = "52998224725";

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    private long cidade, estado, condicao;

    @BeforeEach
    void preparaBancoDescartavel() {
        assumeTrue("salao_scratch".equals(jdbc.queryForObject("select current_database()", String.class)));
        jdbc.execute("""
                truncate table contas_pagar, contas_receber, movimentacoes_estoque, notas_entrada_itens, notas_entrada,
                    pedidos_compra_itens, pedidos_compra, venda_itens, vendas, agendamento_servicos, agendamentos,
                    clientes, funcionarios, funcoes, fornecedores, transportadoras, produtos, ncm_sh,
                    parcelas, condicoes_pagamento, formas_pagamento, cidades, estados, paises, logs_sistema
                    restart identity cascade
                """);
        long pais = id("insert into paises(nome, sigla) values ('Brasil', 'BR') returning id");
        estado = id("insert into estados(nome, uf, pais_id) values ('Paraná', 'PR', " + pais + ") returning id");
        cidade = id("insert into cidades(nome, estado_id) values ('Foz do Iguaçu', " + estado + ") returning id");
        condicao = id("insert into condicoes_pagamento(condicao) values ('À vista') returning id");
    }

    @Test
    void fornecedorGravaTodosOsCamposEConfereDocumentoPeloTipo() throws Exception {
        // jurídica: CNPJ + Inscrição Estadual; o RG enviado é descartado
        enviarPost("/api/fornecedores", """
                {"tipoPessoa":"JURIDICA","fornecedor":"Distribuidora Beleza Ltda","nomeFantasia":"DB Cosméticos",
                 "cpfCnpj":"%s","rg":"123456","inscricaoEstadual":"9012345678","inscEstSubstTrib":"5544",
                 "inscricaoMunicipal":"777","endereco":"Rua das Flores","numero":"100","complemento":"Sala 2",
                 "bairro":"Centro","cep":"85851-000","fone":"(45) 3523-1000","celular":"(45) 99999-0000",
                 "email":"contato@db.com.br","contato":"Maria","site":"www.db.com.br","observacao":"Entrega às terças",
                 "cidadeId":%d,"condicaoPagamentoId":%d}""".formatted(CNPJ, cidade, condicao))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.tipoPessoa").value("JURIDICA"))
                .andExpect(jsonPath("$.cpfCnpj").value("11.222.333/0001-81"))
                .andExpect(jsonPath("$.nomeFantasia").value("DB Cosméticos"))
                .andExpect(jsonPath("$.inscricaoEstadual").value("9012345678"))
                .andExpect(jsonPath("$.inscEstSubstTrib").value("5544"))
                .andExpect(jsonPath("$.rg").value(nullValue()))
                .andExpect(jsonPath("$.numero").value("100"))
                .andExpect(jsonPath("$.complemento").value("Sala 2"))
                .andExpect(jsonPath("$.celular").value("(45) 99999-0000"))
                .andExpect(jsonPath("$.email").value("contato@db.com.br"))
                .andExpect(jsonPath("$.contato").value("Maria"))
                .andExpect(jsonPath("$.site").value("www.db.com.br"))
                .andExpect(jsonPath("$.observacao").value("Entrega às terças"));

        // física com CNPJ não passa; com CPF passa e guarda o RG (e não a inscrição estadual)
        String fisica = """
                {"tipoPessoa":"FISICA","fornecedor":"João Revendedor","cpfCnpj":"%s","rg":"7654321",
                 "inscricaoEstadual":"999","cep":"85851-000"}""";
        enviarPost("/api/fornecedores", fisica.formatted(CNPJ))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Para pessoa física informe o CPF (11 dígitos)."));
        enviarPost("/api/fornecedores", fisica.formatted(CPF))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.cpfCnpj").value("529.982.247-25"))
                .andExpect(jsonPath("$.rg").value("7654321"))
                .andExpect(jsonPath("$.inscricaoEstadual").value(nullValue()));
    }

    @Test
    void transportadoraNoMesmoPadrao() throws Exception {
        enviarPost("/api/transportadoras", """
                {"nome":"Transportes Rápido Ltda","nomeFantasia":"Rápido","cpfCnpj":"%s","inscricaoEstadual":"1234",
                 "email":"frete@rapido.com","site":"rapido.com","numero":"50","complemento":"Galpão 3","cidadeId":%d}"""
                .formatted(CNPJ, cidade))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.tipoPessoa").value("JURIDICA")) // sem tipo = jurídica
                .andExpect(jsonPath("$.nomeFantasia").value("Rápido"))
                .andExpect(jsonPath("$.inscricaoEstadual").value("1234"))
                .andExpect(jsonPath("$.email").value("frete@rapido.com"))
                .andExpect(jsonPath("$.complemento").value("Galpão 3"));

        enviarPost("/api/transportadoras", "{\"nome\":\"Outra\",\"email\":\"sem-arroba\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("E-mail inválido"));
    }

    @Test
    void clienteExigeCondicaoEAceitaPessoaJuridica() throws Exception {
        String base = """
                {"tipoPessoa":"JURIDICA","nome":"Clínica Estética Ltda","email":"clinica@x.com","telefone":"(45) 99988-7766",
                 "endereco":"Av. Brasil","numero":"10","bairro":"Centro","cep":"85851-000","cpfCnpj":"%s",
                 "inscricaoEstadual":"4433","rg":"111","cidadeId":%d,"limiteCredito":500%s}""";
        enviarPost("/api/clientes", base.formatted(CNPJ, cidade, ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Condição de pagamento é obrigatória"));

        enviarPost("/api/clientes", base.formatted(CNPJ, cidade, ",\"condicaoPagamentoId\":" + condicao))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.tipoPessoa").value("JURIDICA"))
                .andExpect(jsonPath("$.cpfCnpj").value("11.222.333/0001-81"))
                .andExpect(jsonPath("$.inscricaoEstadual").value("4433"))
                .andExpect(jsonPath("$.rg").value(nullValue()))
                .andExpect(jsonPath("$.limiteCredito").value(500.0))
                .andExpect(jsonPath("$.condicaoPagamento.id").value((int) condicao));

        // o mesmo CNPJ não pode ser usado por outro cliente
        enviarPost("/api/clientes", base.formatted(CNPJ, cidade, ",\"condicaoPagamentoId\":" + condicao))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("CPF/CNPJ já cadastrado"));
    }

    @Test
    void funcionarioTemFuncaoComSalarioBaseEGravaACidade() throws Exception {
        long funcao = idDe(enviarPost("/api/funcoes", "{\"funcao\":\"Cabeleireira\",\"salarioBase\":2500}")
                .andExpect(status().isCreated()));
        enviarPost("/api/funcoes", "{\"funcao\":\"cabeleireira\",\"salarioBase\":1}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Função já cadastrada"));

        String funcionario = """
                {"nome":"Ana Souza","email":"ana@salao.com","telefone":"(45) 99911-2233","cpfCnpj":"%s","rg":"998877",
                 "dataAdmissao":"2026-01-10","cep":"85851-000","cidadeId":%d%s}""";
        enviarPost("/api/funcionarios", funcionario.formatted(CPF, cidade, ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Função é obrigatória"));

        enviarPost("/api/funcionarios", funcionario.formatted(CPF, cidade, ",\"funcaoId\":" + funcao))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.tipoPessoa").value("FISICA"))
                .andExpect(jsonPath("$.cpfCnpj").value("529.982.247-25"))
                .andExpect(jsonPath("$.rg").value("998877"))
                .andExpect(jsonPath("$.funcao.funcao").value("Cabeleireira"))
                .andExpect(jsonPath("$.salario").value(2500.0))     // sem salário informado: salário base da função
                .andExpect(jsonPath("$.cidade.id").value((int) cidade)); // a cidade antes não era gravada

        enviarDelete("/api/funcoes/" + funcao)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("existem funcionários com esta função")));
    }

    @Test
    void ddiDddAliquotasEPesos() throws Exception {
        enviarPost("/api/paises", "{\"nome\":\"Argentina\",\"sigla\":\"AR\",\"ddi\":\"+54\"}")
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.ddi").value("+54"));
        enviarPost("/api/paises", "{\"nome\":\"Paraguai\",\"sigla\":\"PY\",\"ddi\":\"abc\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("DDI inválido (ex.: +55)"));

        enviarPost("/api/cidades", "{\"nome\":\"Cascavel\",\"estadoId\":" + estado + ",\"ddd\":\"45\"}")
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.ddd").value("45"));

        enviarPost("/api/ncm-sh", "{\"codigo\":\"3305.10.00\",\"descricao\":\"Xampus\",\"aliquotaIcms\":18,\"aliquotaIpi\":7.5}")
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.aliquotaIcms").value(18.0))
                .andExpect(jsonPath("$.aliquotaIpi").value(7.5));

        enviarPost("/api/produtos", "{\"nome\":\"Shampoo 300ml\",\"precoVenda\":35,\"pesoBruto\":0.35,\"pesoLiquido\":0.3,\"quantidadeMinima\":5}")
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$.pesoBruto").value(0.35))
                .andExpect(jsonPath("$.pesoLiquido").value(0.3))
                .andExpect(jsonPath("$.quantidadeMinima").value(5));
        enviarPost("/api/produtos", "{\"nome\":\"Condicionador\",\"precoVenda\":40,\"pesoBruto\":0.2,\"pesoLiquido\":0.3}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Peso líquido não pode ser maior que o peso bruto."));
    }

    // ------------------------------------------------------------------ auxiliares

    private ResultActions enviarPost(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions enviarDelete(String url) throws Exception {
        return mvc.perform(delete(url));
    }

    private long id(String sql) {
        return jdbc.queryForObject(sql, Long.class);
    }

    private long idDe(ResultActions r) throws Exception {
        String corpo = r.andReturn().getResponse().getContentAsString();
        var m = java.util.regex.Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(corpo);
        if (!m.find()) throw new IllegalStateException("sem id na resposta: " + corpo);
        return Long.parseLong(m.group(1));
    }
}
