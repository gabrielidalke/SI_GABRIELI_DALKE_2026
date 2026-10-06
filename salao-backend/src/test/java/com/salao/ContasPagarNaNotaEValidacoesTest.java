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

import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Contas a Pagar dentro da Nota de Entrada, regras do financeiro e validações de Fornecedor, Transportadora e Nota.
 * Mesmo esquema do NotaEntradaFluxoTest: banco DESCARTÁVEL (salao_scratch) e a propriedade -Dsalao.integracao=true.
 *   ./mvnw test -Dtest=ContasPagarNaNotaEValidacoesTest -Dsalao.integracao=true
 */
@EnabledIfSystemProperty(named = "salao.integracao", matches = "true")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/salao_scratch",
        "spring.flyway.enabled=false",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class ContasPagarNaNotaEValidacoesTest {

    private static final String CPF_VALIDO = "529.982.247-25";
    private static final String CNPJ_VALIDO = "11.222.333/0001-81";

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    private final LocalDate hoje = LocalDate.now();
    private long fornA, fornInativo, shampoo, condicao3060, condicaoInativa, classMercadoria;

    @BeforeEach
    void preparaBancoDescartavel() {
        assumeTrue("salao_scratch".equals(jdbc.queryForObject("select current_database()", String.class)));

        jdbc.execute("""
                truncate table contas_pagar, movimentacoes_estoque, notas_entrada_itens, notas_entrada,
                    pedidos_compra_itens, pedidos_compra, logs_sistema, parcelas, condicoes_pagamento,
                    formas_pagamento, produtos, transportadoras, fornecedores restart identity cascade
                """);

        fornA = id("insert into fornecedores(fornecedor) values ('Distribuidora Beleza Ltda') returning id");
        fornInativo = id("insert into fornecedores(fornecedor, ativo) values ('Fornecedor Inativo', false) returning id");
        shampoo = id("insert into produtos(nome, preco_venda) values ('Shampoo 300ml', 35) returning id");

        long boleto = id("insert into formas_pagamento(forma_pagamento) values ('Boleto') returning id");
        condicao3060 = id("insert into condicoes_pagamento(condicao, multa, juro, desconto) values ('30/60 Boleto', 2, 1, 0) returning id");
        jdbc.update("insert into parcelas(numero_parcela, dias_vencimento, percentual, forma_pagamento_id, condicao_pagamento_id) values (1, 30, 50, ?, ?)", boleto, condicao3060);
        jdbc.update("insert into parcelas(numero_parcela, dias_vencimento, percentual, forma_pagamento_id, condicao_pagamento_id) values (2, 60, 50, ?, ?)", boleto, condicao3060);
        condicaoInativa = id("insert into condicoes_pagamento(condicao, ativo) values ('Antiga', false) returning id");
        jdbc.update("insert into parcelas(numero_parcela, dias_vencimento, percentual, forma_pagamento_id, condicao_pagamento_id) values (1, 0, 100, ?, ?)", boleto, condicaoInativa);

        classMercadoria = id("select id from classificacoes_conta order by id limit 1");
    }

    // ------------------------------------------------------------------ contas a pagar dentro da nota

    @Test
    void notaPendenteNaoTemContasEConferidaListaAsContasGeradas() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje.minusDays(2), ",\"condicaoPagamentoId\":" + condicao3060,
                item(shampoo, "10", "20", "0"))).andExpect(status().isCreated())
                .andExpect(jsonPath("$.contasPagar", hasSize(0)));

        enviarPost(url(1001) + "/confirmar", "").andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("CONFERIDA"))
                .andExpect(jsonPath("$.contasPagar", hasSize(2)))
                .andExpect(jsonPath("$.contasPagar[0].valor").value(100.0))
                .andExpect(jsonPath("$.contasPagar[0].situacao").value("ABERTA"))
                .andExpect(jsonPath("$.contasPagar[0].dataVencimento").value(hoje.minusDays(2).plusDays(30).toString()))
                .andExpect(jsonPath("$.contasPagar[1].dataVencimento").value(hoje.minusDays(2).plusDays(60).toString()))
                .andExpect(jsonPath("$.contasPagar[0].nota.numero").value(1001))
                .andExpect(jsonPath("$.contasPagar[0].fornecedor.id").value((int) fornA));

        // o GET da nota traz as mesmas contas; pagar uma delas aparece na nota
        long primeira = id("select id from contas_pagar order by data_vencimento limit 1");
        enviarPost("/api/contas-pagar/" + primeira + "/pagar", "{}").andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("PAGA"));
        enviarGet(url(1001)).andExpect(status().isOk())
                .andExpect(jsonPath("$.contasPagar[0].situacao").value("PAGA"))
                .andExpect(jsonPath("$.contasPagar[1].situacao").value("ABERTA"));

        // a soma das contas é o total da nota
        assertThat(jdbc.queryForObject("select sum(valor) from contas_pagar", java.math.BigDecimal.class))
                .isEqualByComparingTo("200.00");
    }

    @Test
    void contaGeradaPelaNotaSoPodeSerPagaOuCancelada() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "", item(shampoo, "1", "50", "0"))).andExpect(status().isCreated());
        enviarPost(url(1001) + "/confirmar", "").andExpect(status().isOk());
        long conta = id("select id from contas_pagar limit 1");

        enviarPut("/api/contas-pagar/" + conta, conta("Outra descrição", "50", hoje.plusDays(5), fornA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("gerada pela Nota de Entrada")));

        enviarPost("/api/contas-pagar/" + conta + "/cancelar", "").andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("CANCELADA"));
        enviarDelete("/api/contas-pagar/" + conta)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("não podem ser excluídas")));
        assertThat(count("contas_pagar")).isEqualTo(1);

        // cancelada não paga
        enviarPost("/api/contas-pagar/" + conta + "/pagar", "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Não é possível pagar uma conta cancelada"));
    }

    @Test
    void contaManualTemCrudCompletoEValidacoes() throws Exception {
        enviarPost("/api/contas-pagar", conta("Conta de luz", "180.50", hoje.plusDays(10), fornA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.situacao").value("ABERTA"))
                .andExpect(jsonPath("$.nota").value(nullValue()));
        long conta = id("select id from contas_pagar limit 1");

        enviarPut("/api/contas-pagar/" + conta, conta("Conta de luz - set", "190", hoje.plusDays(12), fornA))
                .andExpect(status().isOk()).andExpect(jsonPath("$.valor").value(190.0));
        enviarGet("/api/contas-pagar/" + conta).andExpect(status().isOk());

        // pagar com data futura, pagar duas vezes
        enviarPost("/api/contas-pagar/" + conta + "/pagar", "{\"data\":\"" + hoje.plusDays(1) + "\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Data de pagamento não pode ser futura"));
        enviarPost("/api/contas-pagar/" + conta + "/pagar", "{}").andExpect(status().isOk());
        enviarPost("/api/contas-pagar/" + conta + "/pagar", "{}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Esta conta já foi paga"));
        enviarPost("/api/contas-pagar/" + conta + "/cancelar", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Não é possível cancelar uma conta já paga"));

        // manual cancelada pode ser excluída
        enviarPost("/api/contas-pagar", conta("Outra", "10", hoje, fornA)).andExpect(status().isCreated());
        long outra = id("select id from contas_pagar where descricao = 'Outra'");
        enviarDelete("/api/contas-pagar/" + outra).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Só é possível excluir contas com situação CANCELADA"));
        enviarPost("/api/contas-pagar/" + outra + "/cancelar", "").andExpect(status().isOk());
        enviarDelete("/api/contas-pagar/" + outra).andExpect(status().isNoContent());

        enviarGet("/api/contas-pagar/999999").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Conta a pagar não encontrada"));
    }

    @Test
    void contaManualRejeitaDadosInvalidos() throws Exception {
        enviarPost("/api/contas-pagar", conta("x".repeat(201), "10", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("no máximo 200")));
        enviarPost("/api/contas-pagar", conta("   ", "10", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Descrição é obrigatória")));
        enviarPost("/api/contas-pagar", conta("Valor zero", "0", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("maior que zero")));
        enviarPost("/api/contas-pagar", conta("Valor negativo", "-5", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("maior que zero")));
        enviarPost("/api/contas-pagar", conta("Três decimais", "10.123", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Valor inválido")));
        enviarPost("/api/contas-pagar", conta("Grande demais", "99999999999", hoje, fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Valor inválido")));
        enviarPost("/api/contas-pagar", conta("Ano errado", "10", LocalDate.of(1999, 12, 31), fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Data de vencimento inválida")));
        enviarPost("/api/contas-pagar", conta("Ano distante", "10", hoje.plusYears(11), fornA))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Data de vencimento inválida")));
        enviarPost("/api/contas-pagar", conta("Forn inativo", "10", hoje, fornInativo))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Fornecedor inativo."));
        enviarPost("/api/contas-pagar", conta("Forn inexistente", "10", hoje, 987654))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Fornecedor não encontrado"));
        enviarPost("/api/contas-pagar", "{\"descricao\":\"Sem data\",\"valor\":10,\"fornecedorId\":" + fornA + "}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Data de vencimento é obrigatória")));
        enviarPost("/api/contas-pagar", "{\"descricao\":\"JSON ruim\",\"valor\":\"abc\"}")
                .andExpect(status().isBadRequest());
        assertThat(count("contas_pagar")).isZero();
    }

    // ------------------------------------------------------------------ validações da nota

    @Test
    void notaValidaQuantidadeInteiraFreteCondicaoLimitesETamanhos() throws Exception {
        // estoque é inteiro: quantidade fracionada é recusada (em vez de arredondar e "perder" produto)
        enviarPost("/api/notas-entrada", nota(1, fornA, hoje, "", item(shampoo, "2.5", "10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("quantidade deve ser um número inteiro")));
        // 3 casas decimais zeradas (2.000) é inteiro
        enviarPost("/api/notas-entrada", nota(2, fornA, hoje, "", item(shampoo, "2.000", "10", "0"))).andExpect(status().isCreated());

        enviarPost("/api/notas-entrada", nota(3, fornA, hoje, ",\"valorFrete\":15", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Informe o tipo de frete (CIF ou FOB) quando houver valor de frete."));
        enviarPost("/api/notas-entrada", nota(4, fornA, hoje, ",\"tipoFrete\":\"CIF\",\"valorFrete\":15", item(shampoo, "1", "10", "0")))
                .andExpect(status().isCreated());

        enviarPost("/api/notas-entrada", nota(5, fornA, hoje, ",\"condicaoPagamentoId\":" + condicaoInativa, item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Condição de pagamento inativa."));

        enviarPost("/api/notas-entrada", nota(6, fornA, LocalDate.of(1999, 12, 31), "", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Data de emissão inválida (anterior a 2000)."));

        // limites da chave
        enviarPost("/api/notas-entrada", nota(1_000_000_000L, fornA, hoje, "", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Número deve ter no máximo 9 dígitos")));
        enviarPost("/api/notas-entrada", notaComChave(100, 1, 7, fornA, hoje, item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Modelo deve ter no máximo 2 dígitos")));
        enviarPost("/api/notas-entrada", notaComChave(55, 1000, 7, fornA, hoje, item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Série deve ter no máximo 3 dígitos")));
        enviarPost("/api/notas-entrada", notaComChave(55, 0, 7, fornA, hoje, item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Série deve ser maior que zero")));

        // valores que não cabem no banco viram erro claro (e não um 500)
        enviarPost("/api/notas-entrada", nota(8, fornA, hoje, "", item(shampoo, "9999999", "9999999.99", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("grande demais")));
        enviarPost("/api/notas-entrada", nota(9, fornA, hoje, ",\"tipoFrete\":\"FOB\",\"valorFrete\":99999999999", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Valor do frete inválido")));
        enviarPost("/api/notas-entrada", nota(10, fornA, hoje, ",\"observacoes\":\"" + "x".repeat(501) + "\"", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("no máximo 500")));

        // até 200 produtos: com 201 itens o Bean Validation barra antes de qualquer consulta
        String muitos = IntStream.range(0, 201).mapToObj(i -> item(shampoo, "1", "1", "0")).collect(Collectors.joining(","));
        enviarPost("/api/notas-entrada", nota(11, fornA, hoje, "", muitos))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("no máximo 200 produtos")));

        assertThat(count("notas_entrada")).isEqualTo(2);   // só as duas válidas (números 2 e 4)
    }

    @Test
    void notaInexistenteEFornecedorInativoRetornamMensagemClara() throws Exception {
        enviarGet(url(777)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Nota de entrada não encontrada."));
        enviarPost("/api/notas-entrada", nota(1, fornInativo, hoje, "", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Fornecedor inativo."));
        enviarPost("/api/notas-entrada", nota(1, 987654, hoje, "", item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Fornecedor não encontrado."));
        enviarGet("/api/notas-entrada/existe?modelo=55&serie=1&numero=abc&fornecedorId=" + fornA)
                .andExpect(status().isBadRequest());
    }

    // ------------------------------------------------------------------ fornecedor

    @Test
    void fornecedorGravaDocumentoFormatadoEBarraDuplicidadeMesmoSemMascara() throws Exception {
        enviarPost("/api/fornecedores", fornecedorJson("Beleza Cia", CNPJ_VALIDO, "01310-100", "(11) 91234-5678"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.cpfCnpj").value(CNPJ_VALIDO));

        // o mesmo CNPJ sem máscara é o mesmo documento
        enviarPost("/api/fornecedores", fornecedorJson("Outro Nome", "11222333000181", "01310-100", null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Já existe um fornecedor cadastrado com este CPF/CNPJ."));

        // CPF sem máscara é gravado formatado
        enviarPost("/api/fornecedores", fornecedorJson("Autônoma Maria", "52998224725", "01310100", null))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.cpfCnpj").value(CPF_VALIDO));

        // editar sem mudar o documento não conflita com ele mesmo
        long id = id("select id from fornecedores where fornecedor = 'Beleza Cia'");
        enviarPut("/api/fornecedores/" + id, fornecedorJson("Beleza Cia Ltda", CNPJ_VALIDO, "01310-100", "(11) 91234-5678"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.fornecedor").value("Beleza Cia Ltda"));
        // mas não pode virar o documento de outro
        enviarPut("/api/fornecedores/" + id, fornecedorJson("Beleza Cia Ltda", CPF_VALIDO, "01310-100", null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Já existe um fornecedor cadastrado com este CPF/CNPJ."));
    }

    @Test
    void fornecedorValidaCamposETamanhos() throws Exception {
        enviarPost("/api/fornecedores", fornecedorJson("Doc Inválido", "11.222.333/0001-82", "01310-100", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CNPJ inválido."));
        enviarPost("/api/fornecedores", fornecedorJson("Doc Inválido", "111.111.111-11", "01310-100", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CPF inválido."));
        enviarPost("/api/fornecedores", fornecedorJson("Doc Com Letra", "ABC.222.333/0001-81", "01310-100", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("apenas números")));
        enviarPost("/api/fornecedores", fornecedorJson("x".repeat(151), null, "01310-100", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("entre 3 e 150")));
        enviarPost("/api/fornecedores", fornecedorJson("Ab", null, "01310-100", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("entre 3 e 150")));
        enviarPost("/api/fornecedores", fornecedorJson("CEP Ruim", null, "1234", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CEP inválido"));
        enviarPost("/api/fornecedores", fornecedorJson("Fone Ruim", null, "01310-100", "123"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Telefone inválido"));
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"Sem CEP\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CEP é obrigatório"));
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"Endereço Longo\",\"cep\":\"01310-100\",\"endereco\":\"" + "e".repeat(201) + "\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Endereço deve ter no máximo 200")));
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"IE Longa\",\"cep\":\"01310-100\",\"inscricaoEstadual\":\"" + "1".repeat(21) + "\"}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("Inscrição estadual")));
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"Cidade X\",\"cep\":\"01310-100\",\"cidadeId\":987654}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Cidade não encontrada"));
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"Cond X\",\"cep\":\"01310-100\",\"condicaoPagamentoId\":987654}")
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Condição de pagamento não encontrada"));

        // texto em branco vira nulo, espaços das pontas são cortados
        enviarPost("/api/fornecedores", "{\"fornecedor\":\"  Espaçado  \",\"cep\":\"01310-100\",\"bairro\":\"   \",\"inscricaoEstadual\":\"ISENTO\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fornecedor").value("Espaçado"))
                .andExpect(jsonPath("$.bairro").value(nullValue()))
                .andExpect(jsonPath("$.inscricaoEstadual").value("ISENTO"));
    }

    @Test
    void fornecedorComMovimentoNaoPodeSerExcluido() throws Exception {
        enviarPost("/api/notas-entrada", nota(1, fornA, hoje, "", item(shampoo, "1", "10", "0"))).andExpect(status().isCreated());
        enviarDelete("/api/fornecedores/" + fornA).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Fornecedor possui notas de entrada vinculadas e não pode ser excluído"));

        enviarDelete("/api/fornecedores/" + fornInativo).andExpect(status().isNoContent());
        enviarDelete("/api/fornecedores/" + fornInativo).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Fornecedor não encontrado"));
    }

    // ------------------------------------------------------------------ transportadora

    @Test
    void transportadoraValidaDocumentoDuplicidadeETamanhos() throws Exception {
        enviarPost("/api/transportadoras", transportadoraJson("Rápido Transportes", CNPJ_VALIDO, "01310-100", "(11) 3456-7890"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.cpfCnpj").value(CNPJ_VALIDO));
        enviarPost("/api/transportadoras", transportadoraJson("Outra Transportes", "11222333000181", null, null))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Já existe uma transportadora cadastrada com este CPF/CNPJ."));
        enviarPost("/api/transportadoras", transportadoraJson("  rápido transportes ", null, null, null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Transportadora já cadastrada"));
        enviarPost("/api/transportadoras", transportadoraJson("Doc Ruim", "123.456.789-00", null, null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CPF inválido."));
        enviarPost("/api/transportadoras", transportadoraJson("n".repeat(151), null, null, null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value(containsString("entre 3 e 150")));
        enviarPost("/api/transportadoras", transportadoraJson("CEP Ruim", null, "abc", null))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("CEP inválido"));
    }

    @Test
    void transportadoraEmNotaNaoPodeSerExcluidaEInativaNaoVaiParaNota() throws Exception {
        enviarPost("/api/transportadoras", transportadoraJson("Rápido Transportes", null, null, null)).andExpect(status().isCreated());
        long t = id("select id from transportadoras limit 1");
        enviarPost("/api/notas-entrada", nota(1, fornA, hoje, ",\"transportadoraId\":" + t, item(shampoo, "1", "10", "0")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.transportadora.nome").value("Rápido Transportes"));
        enviarDelete("/api/transportadoras/" + t).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("notas de entrada vinculadas")));

        jdbc.update("update transportadoras set ativo = false where id = ?", t);
        enviarPost("/api/notas-entrada", nota(2, fornA, hoje, ",\"transportadoraId\":" + t, item(shampoo, "1", "10", "0")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.mensagem").value("Transportadora inativa."));
    }

    // ------------------------------------------------------------------ auxiliares

    private ResultActions enviarPost(String url, String json) throws Exception {
        return mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions enviarPut(String url, String json) throws Exception {
        return mvc.perform(put(url).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions enviarDelete(String url) throws Exception {
        return mvc.perform(delete(url));
    }

    private ResultActions enviarGet(String url) throws Exception {
        return mvc.perform(get(url));
    }

    private String url(long numero) {
        return "/api/notas-entrada/55/1/" + numero + "/" + fornA;
    }

    private String nota(long numero, long fornecedorId, LocalDate emissao, String extras, String... itens) {
        return "{\"modelo\":55,\"serie\":1,\"numero\":" + numero + ",\"fornecedorId\":" + fornecedorId
                + ",\"dataEmissao\":\"" + emissao + "\"" + extras + ",\"itens\":[" + String.join(",", itens) + "]}";
    }

    private String notaComChave(int modelo, int serie, int numero, long fornecedorId, LocalDate emissao, String... itens) {
        return "{\"modelo\":" + modelo + ",\"serie\":" + serie + ",\"numero\":" + numero + ",\"fornecedorId\":" + fornecedorId
                + ",\"dataEmissao\":\"" + emissao + "\",\"itens\":[" + String.join(",", itens) + "]}";
    }

    private String item(long produtoId, String quantidade, String valorUnitario, String desconto) {
        return "{\"produtoId\":" + produtoId + ",\"classificacaoContaId\":" + classMercadoria
                + ",\"quantidade\":" + quantidade + ",\"valorUnitario\":" + valorUnitario
                + ",\"descontoPercentual\":" + desconto + "}";
    }

    private String conta(String descricao, String valor, LocalDate vencimento, long fornecedorId) {
        return "{\"descricao\":\"" + descricao + "\",\"valor\":" + valor + ",\"dataVencimento\":\"" + vencimento
                + "\",\"fornecedorId\":" + fornecedorId + "}";
    }

    private String fornecedorJson(String nome, String cpfCnpj, String cep, String fone) {
        return "{\"fornecedor\":\"" + nome + "\"" + campo("cpfCnpj", cpfCnpj) + campo("cep", cep) + campo("fone", fone) + "}";
    }

    private String transportadoraJson(String nome, String cpfCnpj, String cep, String fone) {
        return "{\"nome\":\"" + nome + "\"" + campo("cpfCnpj", cpfCnpj) + campo("cep", cep) + campo("fone", fone) + "}";
    }

    private String campo(String nome, String valor) {
        return valor == null ? "" : ",\"" + nome + "\":\"" + valor + "\"";
    }

    private long id(String sql) {
        return jdbc.queryForObject(sql, Long.class);
    }

    private int count(String tabela) {
        return jdbc.queryForObject("select count(*) from " + tabela, Integer.class);
    }
}
