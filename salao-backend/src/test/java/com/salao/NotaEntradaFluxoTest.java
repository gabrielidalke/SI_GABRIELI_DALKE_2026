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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Teste de integração do fluxo da Nota de Entrada (criar, editar, confirmar, excluir, Pedido de Compra).
 *
 * Roda contra um banco DESCARTÁVEL (salao_scratch) — nunca contra o salao_db. Para executar:
 *   1) createdb salao_scratch  e rodar o schema.sql nele (sem as linhas CREATE DATABASE e \c)
 *   2) ./mvnw test -Dtest=NotaEntradaFluxoTest -Dsalao.integracao=true
 * Sem a propriedade salao.integracao o teste é ignorado.
 */
@EnabledIfSystemProperty(named = "salao.integracao", matches = "true")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/salao_scratch",
        "spring.flyway.enabled=false",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class NotaEntradaFluxoTest {

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    private final LocalDate hoje = LocalDate.now();
    private long fornA, fornB, shampoo, condicionador, escova, condicao3060, classMercadoria, classConsumo;

    @BeforeEach
    void preparaBancoDescartavel() {
        // Trava de segurança: só limpa se for mesmo o banco descartável
        assumeTrue("salao_scratch".equals(jdbc.queryForObject("select current_database()", String.class)));

        jdbc.execute("""
                truncate table contas_pagar, movimentacoes_estoque, notas_entrada_itens, notas_entrada,
                    pedidos_compra_itens, pedidos_compra, logs_sistema, parcelas, condicoes_pagamento,
                    formas_pagamento, produtos, fornecedores restart identity cascade
                """);

        fornA = id("insert into fornecedores(fornecedor) values ('Distribuidora Beleza Ltda') returning id");
        fornB = id("insert into fornecedores(fornecedor) values ('Outro Fornecedor Ltda') returning id");
        shampoo = id("insert into produtos(nome, preco_venda) values ('Shampoo 300ml', 35) returning id");
        condicionador = id("insert into produtos(nome, preco_venda) values ('Condicionador 300ml', 60) returning id");
        escova = id("insert into produtos(nome, preco_venda) values ('Escova', 25) returning id");

        long boleto = id("insert into formas_pagamento(forma_pagamento) values ('Boleto') returning id");
        condicao3060 = id("insert into condicoes_pagamento(condicao, multa, juro, desconto) values ('30/60 Boleto', 2, 1, 0) returning id");
        jdbc.update("insert into parcelas(numero_parcela, dias_vencimento, percentual, forma_pagamento_id, condicao_pagamento_id) values (1, 30, 50, ?, ?)", boleto, condicao3060);
        jdbc.update("insert into parcelas(numero_parcela, dias_vencimento, percentual, forma_pagamento_id, condicao_pagamento_id) values (2, 60, 50, ?, ?)", boleto, condicao3060);

        List<Long> classes = jdbc.queryForList("select id from classificacoes_conta order by id limit 2", Long.class);
        classMercadoria = classes.get(0);
        classConsumo = classes.get(1);
    }

    // ------------------------------------------------------------------ criação

    @Test
    void criaNotaPendenteComTotaisRateiosECustoCorretos() throws Exception {
        // o cliente tenta mandar situacao CONFERIDA: o backend ignora e força PENDENTE
        String json = nota(1001, fornA, hoje.minusDays(2),
                ",\"situacao\":\"CONFERIDA\",\"tipoFrete\":\"FOB\",\"valorFrete\":30,\"valorSeguro\":8,\"placaVeiculo\":\"abc1d23\"",
                item(shampoo, classMercadoria, "10", "20", "0"),
                item(condicionador, classMercadoria, "5", "40", "10"));

        enviarPost("/api/notas-entrada", json)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.situacao").value("PENDENTE"))
                .andExpect(jsonPath("$.valorProdutos").value(400.0))
                .andExpect(jsonPath("$.valorDesconto").value(20.0))
                .andExpect(jsonPath("$.valorTotal").value(418.0))
                .andExpect(jsonPath("$.placaVeiculo").value("ABC1D23"))
                // frete 30 + seguro 8 rateados pelo valor líquido (200 e 180): 20,00 e 18,00
                .andExpect(jsonPath("$.itens[0].rateioFrete").value(15.79))
                .andExpect(jsonPath("$.itens[0].rateioSeguro").value(4.21))
                .andExpect(jsonPath("$.itens[1].rateioFrete").value(14.21))
                .andExpect(jsonPath("$.itens[1].rateioSeguro").value(3.79))
                // custoFinal é o custo UNITÁRIO: (200 + 20) / 10 e (180 + 18) / 5
                .andExpect(jsonPath("$.itens[0].custoFinal").value(22.0))
                .andExpect(jsonPath("$.itens[1].custoFinal").value(39.6));

        // criar NÃO mexe em estoque nem em contas a pagar
        assertThat(qtdEstoque(shampoo)).isZero();
        assertThat(count("contas_pagar")).isZero();
        assertThat(count("movimentacoes_estoque")).isZero();
    }

    @Test
    void naoPermiteChaveDuplicadaMasPermiteMesmoNumeroEmOutroFornecedor() throws Exception {
        String itens = item(shampoo, classMercadoria, "1", "10", "0");
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "", itens)).andExpect(status().isCreated());

        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("Já existe uma nota de entrada")));

        enviarPost("/api/notas-entrada", nota(1001, fornB, hoje, "", itens)).andExpect(status().isCreated());
        assertThat(count("notas_entrada")).isEqualTo(2);
    }

    @Test
    void validaDatasPlacaTipoFreteEItensRepetidos() throws Exception {
        String itens = item(shampoo, classMercadoria, "1", "10", "0");

        enviarPost("/api/notas-entrada", nota(1, fornA, hoje.plusDays(1), "", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Data de emissão não pode ser posterior à data atual."));

        enviarPost("/api/notas-entrada", nota(2, fornA, hoje.minusDays(3), ",\"dataChegada\":\"" + hoje.minusDays(4) + "\"", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Data de chegada não pode ser anterior à data de emissão."));

        enviarPost("/api/notas-entrada", nota(3, fornA, hoje.minusDays(3), ",\"dataChegada\":\"" + hoje.plusDays(1) + "\"", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Data de chegada não pode ser posterior à data atual."));

        // chegada igual à emissão e chegada igual a hoje são permitidas
        enviarPost("/api/notas-entrada", nota(4, fornA, hoje.minusDays(3), ",\"dataChegada\":\"" + hoje.minusDays(3) + "\"", itens))
                .andExpect(status().isCreated());
        enviarPost("/api/notas-entrada", nota(5, fornA, hoje.minusDays(3), ",\"dataChegada\":\"" + hoje + "\"", itens))
                .andExpect(status().isCreated());

        enviarPost("/api/notas-entrada", nota(6, fornA, hoje, ",\"placaVeiculo\":\"123\"", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("Placa inválida")));

        enviarPost("/api/notas-entrada", nota(7, fornA, hoje, ",\"tipoFrete\":\"XYZ\"", itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Tipo de frete deve ser CIF ou FOB"));

        enviarPost("/api/notas-entrada", nota(8, fornA, hoje, "", itens, itens))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("aparece mais de uma vez")));

        enviarPost("/api/notas-entrada", nota(9, fornA, hoje, "", item(shampoo, classMercadoria, "0", "10", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Quantidade deve ser maior que zero"));
    }

    // ------------------------------------------------------------------ confirmação

    @Test
    void confirmarSemProdutosEhBloqueado() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "")).andExpect(status().isCreated());

        enviarPost(url(1001, fornA) + "/confirmar", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("A nota não pode ser confirmada porque não possui produtos."));

        assertThat(situacao(1001, fornA)).isEqualTo("PENDENTE");
    }

    @Test
    void confirmarGeraEstoqueContasAPagarEFechaANota() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje.minusDays(2),
                ",\"valorFrete\":30,\"valorSeguro\":8,\"condicaoPagamentoId\":" + condicao3060,
                item(shampoo, classMercadoria, "10", "20", "0"),
                item(condicionador, classMercadoria, "5", "40", "10"))).andExpect(status().isCreated());

        enviarPost(url(1001, fornA) + "/confirmar", "")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("CONFERIDA"));

        // dataChegada estava vazia: preenchida com a data atual
        assertThat(jdbc.queryForObject("select data_chegada from notas_entrada where numero = 1001", LocalDate.class)).isEqualTo(hoje);

        // estoque
        assertThat(qtdEstoque(shampoo)).isEqualTo(10);
        assertThat(qtdEstoque(condicionador)).isEqualTo(5);
        List<Map<String, Object>> mov = jdbc.queryForList(
                "select * from movimentacoes_estoque order by produto_id");
        assertThat(mov).hasSize(2);
        assertThat(mov.get(0)).containsEntry("tipo", "ENTRADA").containsEntry("origem_tipo", "NOTA_ENTRADA")
                .containsEntry("saldo_anterior", 0).containsEntry("saldo_resultante", 10);
        assertThat((BigDecimal) mov.get(0).get("custo_unitario")).isEqualByComparingTo("22.0000");
        assertThat((BigDecimal) mov.get(1).get("custo_unitario")).isEqualByComparingTo("39.6000");
        assertThat(mov.get(0).get("documento")).isEqualTo("Entrada da Nota 1001/1 - Fornecedor " + fornA);

        // contas a pagar: 2 parcelas de 50% do total (418), vencendo emissão + 30 e + 60 dias
        List<Map<String, Object>> contas = jdbc.queryForList("select * from contas_pagar order by data_vencimento");
        assertThat(contas).hasSize(2);
        assertThat((BigDecimal) contas.get(0).get("valor")).isEqualByComparingTo("209.00");
        assertThat((BigDecimal) contas.get(1).get("valor")).isEqualByComparingTo("209.00");
        assertThat(contas.get(0).get("data_vencimento").toString()).isEqualTo(hoje.minusDays(2).plusDays(30).toString());
        assertThat(contas.get(1).get("data_vencimento").toString()).isEqualTo(hoje.minusDays(2).plusDays(60).toString());
        assertThat(contas.get(0)).containsEntry("nota_numero", 1001).containsEntry("nota_fornecedor_id", fornA);
        assertThat((BigDecimal) contas.get(0).get("percentual_multa")).isEqualByComparingTo("2");
        assertThat(contas.get(0).get("descricao").toString()).contains("Parcela 1/2");

        // log
        assertThat(jdbc.queryForList("select acao from logs_sistema order by id", String.class))
                .containsExactly("CRIOU", "CONFIRMOU");

        // depois de CONFERIDA: não edita, não exclui, não confirma de novo
        enviarPut(url(1001, fornA), nota(1001, fornA, hoje, "", item(shampoo, classMercadoria, "1", "1", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Somente notas PENDENTES podem ser editadas."));
        enviarDelete(url(1001, fornA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Somente notas PENDENTES podem ser excluídas."));
        enviarPost(url(1001, fornA) + "/confirmar", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Somente notas PENDENTES podem ser confirmadas."));

        assertThat(qtdEstoque(shampoo)).isEqualTo(10);       // não entrou duas vezes
        assertThat(count("contas_pagar")).isEqualTo(2);
    }

    @Test
    void confirmarSemCondicaoGeraUmaContaNaDataDeEmissao() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje.minusDays(5), "",
                item(shampoo, classMercadoria, "2", "50", "0"))).andExpect(status().isCreated());
        enviarPost(url(1001, fornA) + "/confirmar", "").andExpect(status().isOk());

        List<Map<String, Object>> contas = jdbc.queryForList("select * from contas_pagar");
        assertThat(contas).hasSize(1);
        assertThat((BigDecimal) contas.get(0).get("valor")).isEqualByComparingTo("100.00");
        assertThat(contas.get(0).get("data_vencimento").toString()).isEqualTo(hoje.minusDays(5).toString());
    }

    @Test
    void confirmarComCustoZeroEhRejeitadoSemEfeitoNenhum() throws Exception {
        // um item válido e outro com valor unitário 0 e sem rateio: custo = 0 -> a confirmação inteira é recusada
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "",
                item(shampoo, classMercadoria, "10", "20", "0"),
                item(escova, classMercadoria, "1", "0", "0"))).andExpect(status().isCreated());

        enviarPost(url(1001, fornA) + "/confirmar", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Produto Escova: o custo deve ser maior que zero."));

        assertThat(situacao(1001, fornA)).isEqualTo("PENDENTE");
        assertThat(qtdEstoque(shampoo)).isZero();            // o item válido também NÃO entrou
        assertThat(count("movimentacoes_estoque")).isZero();
        assertThat(count("contas_pagar")).isZero();
    }

    // ------------------------------------------------------------------ edição e exclusão

    @Test
    void editaRecalculaTrocaItensEBloqueiaTrocaDeClassificacao() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "",
                item(shampoo, classMercadoria, "10", "20", "0"),
                item(condicionador, classMercadoria, "5", "40", "0"))).andExpect(status().isCreated());

        // quantidade do shampoo -> 20, condicionador sai da nota, escova entra, frete 10
        enviarPut(url(1001, fornA), nota(1001, fornA, hoje, ",\"valorFrete\":10",
                item(shampoo, classMercadoria, "20", "20", "0"),
                item(escova, classConsumo, "2", "5", "0")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("PENDENTE"))
                .andExpect(jsonPath("$.valorProdutos").value(410.0))
                .andExpect(jsonPath("$.valorTotal").value(420.0))
                .andExpect(jsonPath("$.itens.length()").value(2));
        assertThat(count("notas_entrada_itens")).isEqualTo(2);

        // a classificação de um item que já estava na nota não pode ser trocada
        enviarPut(url(1001, fornA), nota(1001, fornA, hoje, "",
                item(shampoo, classConsumo, "20", "20", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("classificação da conta de um item já adicionado")));

        // a chave não pode ser alterada pelo corpo da requisição
        enviarPut(url(1001, fornA), nota(1002, fornA, hoje, "", item(shampoo, classMercadoria, "1", "1", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("não pode ser alterada")));
    }

    @Test
    void excluiNotaPendenteComSeusItens() throws Exception {
        enviarPost("/api/notas-entrada", nota(1001, fornA, hoje, "",
                item(shampoo, classMercadoria, "1", "10", "0"))).andExpect(status().isCreated());

        enviarDelete(url(1001, fornA)).andExpect(status().isNoContent());

        assertThat(count("notas_entrada")).isZero();
        assertThat(count("notas_entrada_itens")).isZero();
        enviarGet(url(1001, fornA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Nota de entrada não encontrada."));
    }

    // ------------------------------------------------------------------ pedido de compra

    @Test
    void pedidoDeCompraRecebeRevertePorEdicaoExclusaoEMudaDeSituacao() throws Exception {
        enviarPost("/api/pedidos-compra", pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}",
                "{\"produtoId\":" + condicionador + ",\"quantidade\":5,\"valorUnitario\":40}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.situacao").value("ABERTA"));

        // recebe só 4 shampoos -> PARCIAL
        String pedidoLink = ",\"pedidoNumero\":1001,\"pedidoSerie\":1,\"pedidoModelo\":1";
        enviarPost("/api/notas-entrada", nota(2001, fornA, hoje, pedidoLink,
                item(shampoo, classMercadoria, "4", "20", "0"))).andExpect(status().isCreated());
        assertThat(situacaoPedido(1001)).isEqualTo("PARCIAL");
        assertThat(recebido(1001, shampoo)).isEqualByComparingTo("4");

        // editar reverte o recebimento antigo (4) e aplica o novo (10 + 5): não pode virar 14
        enviarPut(url(2001, fornA), nota(2001, fornA, hoje, pedidoLink,
                item(shampoo, classMercadoria, "10", "20", "0"),
                item(condicionador, classMercadoria, "5", "40", "0"))).andExpect(status().isOk());
        assertThat(recebido(1001, shampoo)).isEqualByComparingTo("10");
        assertThat(recebido(1001, condicionador)).isEqualByComparingTo("5");
        assertThat(situacaoPedido(1001)).isEqualTo("CONCLUIDA");

        // diminuir a quantidade volta o pedido para PARCIAL
        enviarPut(url(2001, fornA), nota(2001, fornA, hoje, pedidoLink,
                item(shampoo, classMercadoria, "3", "20", "0"))).andExpect(status().isOk());
        assertThat(recebido(1001, shampoo)).isEqualByComparingTo("3");
        assertThat(recebido(1001, condicionador)).isEqualByComparingTo("0");
        assertThat(situacaoPedido(1001)).isEqualTo("PARCIAL");

        // enquanto há nota vinculada, o pedido não pode ser excluído nem alterado
        enviarDelete("/api/pedidos-compra/1/1/1001/" + fornA)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("notas de entrada vinculadas")));
        enviarPut("/api/pedidos-compra/1/1/1001/" + fornA, pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":99,\"valorUnitario\":20}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("já possui itens recebidos")));

        // excluir a nota devolve o pedido para ABERTA
        enviarDelete(url(2001, fornA)).andExpect(status().isNoContent());
        assertThat(recebido(1001, shampoo)).isEqualByComparingTo("0");
        assertThat(situacaoPedido(1001)).isEqualTo("ABERTA");

        // sem nota e sem recebimento, o pedido pode ser alterado e excluído
        enviarPut("/api/pedidos-compra/1/1/1001/" + fornA, pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":12,\"valorUnitario\":20}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens.length()").value(1));
        enviarDelete("/api/pedidos-compra/1/1/1001/" + fornA).andExpect(status().isNoContent());
        assertThat(count("pedidos_compra")).isZero();
    }

    @Test
    void notaVinculadaExigeMesmoFornecedorEProdutosDoPedido() throws Exception {
        enviarPost("/api/pedidos-compra", pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}"))
                .andExpect(status().isCreated());
        String pedidoLink = ",\"pedidoNumero\":1001,\"pedidoSerie\":1,\"pedidoModelo\":1";

        // outro fornecedor não enxerga o pedido
        enviarPost("/api/notas-entrada", nota(2001, fornB, hoje, pedidoLink,
                item(shampoo, classMercadoria, "1", "20", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("não encontrado para este fornecedor")));

        // produto que não está no pedido
        enviarPost("/api/notas-entrada", nota(2002, fornA, hoje, pedidoLink,
                item(escova, classMercadoria, "1", "20", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("não faz parte do Pedido de Compra")));
        assertThat(count("notas_entrada")).isZero();          // nada ficou pela metade
        assertThat(recebido(1001, shampoo)).isEqualByComparingTo("0");

        // os três campos do pedido vêm juntos
        enviarPost("/api/notas-entrada", nota(2003, fornA, hoje, ",\"pedidoNumero\":1001",
                item(shampoo, classMercadoria, "1", "20", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("informe número, série e modelo")));
    }

    @Test
    void emissaoDaNotaNaoPodeSerAnteriorAoPedido() throws Exception {
        // pedido feito há 3 dias
        enviarPost("/api/pedidos-compra", pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}")
                .replace(hoje.toString(), hoje.minusDays(3).toString()))
                .andExpect(status().isCreated());
        String pedidoLink = ",\"pedidoNumero\":1001,\"pedidoSerie\":1,\"pedidoModelo\":1";
        String dataPedidoBR = hoje.minusDays(3).format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));

        // nota emitida antes do pedido: bloqueia (criar)
        enviarPost("/api/notas-entrada", nota(2001, fornA, hoje.minusDays(4), pedidoLink,
                item(shampoo, classMercadoria, "1", "20", "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(
                        "Data de emissão não pode ser anterior à data do Pedido de Compra (" + dataPedidoBR + ")."));
        assertThat(count("notas_entrada")).isZero();

        // no mesmo dia do pedido é permitido (sem produtos, para o pedido continuar editável)
        enviarPost("/api/notas-entrada", nota(2001, fornA, hoje.minusDays(3), pedidoLink)).andExpect(status().isCreated());

        // editar a nota para antes do pedido também bloqueia
        enviarPut(url(2001, fornA), nota(2001, fornA, hoje.minusDays(5), pedidoLink))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("anterior à data do Pedido de Compra")));

        // e o pedido não pode passar a ter data depois da emissão da nota vinculada
        enviarPut("/api/pedidos-compra/1/1/1001/" + fornA, pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("posterior à emissão da nota de entrada vinculada")));

        // sem pedido vinculado, a regra não se aplica
        enviarPost("/api/notas-entrada", nota(2002, fornA, hoje.minusDays(10), "",
                item(shampoo, classMercadoria, "1", "20", "0"))).andExpect(status().isCreated());
    }

    // ------------------------------------------------------------------ pedido completo e parcelas

    @Test
    void pedidoCalculaDescontoTotaisEGuardaCondicaoFreteESeguro() throws Exception {
        // Shampoo 10 x 20 (sem desconto) + Condicionador 5 x 40 com 10%; frete 30, seguro 8, outras 2
        enviarPost("/api/pedidos-compra", pedidoCompleto(1001, fornA,
                ",\"condicaoPagamentoId\":" + condicao3060 + ",\"valorFrete\":30,\"valorSeguro\":8,\"outrasDespesas\":2",
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}",
                "{\"produtoId\":" + condicionador + ",\"quantidade\":5,\"valorUnitario\":40,\"descontoPercentual\":10}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.situacao").value("ABERTA"))
                .andExpect(jsonPath("$.condicaoPagamento.id").value((int) condicao3060))
                .andExpect(jsonPath("$.valorProdutos").value(400.0))
                .andExpect(jsonPath("$.valorDesconto").value(20.0))
                .andExpect(jsonPath("$.valorLiquido").value(380.0))
                .andExpect(jsonPath("$.valorFrete").value(30.0))
                .andExpect(jsonPath("$.valorTotal").value(420.0))
                .andExpect(jsonPath("$.itens[1].valorBruto").value(200.0))
                .andExpect(jsonPath("$.itens[1].descontoValor").value(20.0))
                .andExpect(jsonPath("$.itens[1].valorLiquido").value(180.0))
                .andExpect(jsonPath("$.itens[1].classificacaoContaId").value((int) classMercadoria));

        // volta igual ao reabrir
        enviarGet("/api/pedidos-compra/1/1/1001/" + fornA)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valorTotal").value(420.0))
                .andExpect(jsonPath("$.itens[0].classificacaoNome").exists());

        // classificação é obrigatória nos itens do pedido
        enviarPost("/api/pedidos-compra",
                "{\"modelo\":1,\"serie\":1,\"numero\":1002,\"fornecedorId\":" + fornA + ",\"dataPedido\":\"" + hoje
                        + "\",\"itens\":[{\"produtoId\":" + shampoo + ",\"quantidade\":1,\"valorUnitario\":10}]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("Classificação da conta do item é obrigatória"));

        // desconto fora de 0..100 e frete negativo
        enviarPost("/api/pedidos-compra", pedidoCompleto(1003, fornA, ",\"valorFrete\":-1",
                "{\"produtoId\":" + shampoo + ",\"quantidade\":1,\"valorUnitario\":10,\"descontoPercentual\":150}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value(containsString("Desconto deve estar entre 0 e 100%")));
    }

    @Test
    void previaDeParcelasUsaOMesmoCalculoDaConfirmacao() throws Exception {
        // 30/60 (50% e 50%) sobre 418,01 -> a última parcela absorve o centavo
        enviarGet("/api/condicoes-pagamento/" + condicao3060 + "/parcelas?valor=418.01&data=2026-08-01")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].numero").value(1))
                .andExpect(jsonPath("$[0].diasVencimento").value(30))
                .andExpect(jsonPath("$[0].dataVencimento").value("2026-08-31"))
                .andExpect(jsonPath("$[0].valor").value(209.01))
                .andExpect(jsonPath("$[0].formaPagamento").value("Boleto"))
                .andExpect(jsonPath("$[1].dataVencimento").value("2026-09-30"))
                .andExpect(jsonPath("$[1].valor").value(209.0));

        enviarGet("/api/condicoes-pagamento/" + condicao3060 + "/parcelas?valor=0&data=2026-08-01")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensagem").value("O valor total deve ser maior que zero para gerar as parcelas."));

        // a nota confirmada gera exatamente as parcelas da prévia
        enviarPost("/api/notas-entrada", nota(2001, fornA, hoje.minusDays(2),
                ",\"condicaoPagamentoId\":" + condicao3060, item(shampoo, classMercadoria, "1", "418.01", "0")))
                .andExpect(status().isCreated());
        enviarPost(url(2001, fornA) + "/confirmar", "").andExpect(status().isOk());
        List<Map<String, Object>> contas = jdbc.queryForList("select valor from contas_pagar order by data_vencimento");
        assertThat((BigDecimal) contas.get(0).get("valor")).isEqualByComparingTo("209.01");
        assertThat((BigDecimal) contas.get(1).get("valor")).isEqualByComparingTo("209.00");
    }

    // ------------------------------------------------------------------ listagens

    @Test
    void todasAsListagensDoSistemaRespondemSemErro() throws Exception {
        // deixa dados em todas as tabelas envolvidas: pedido, nota conferida, estoque, contas a pagar, log
        enviarPost("/api/pedidos-compra", pedido(1001, fornA,
                "{\"produtoId\":" + shampoo + ",\"quantidade\":10,\"valorUnitario\":20}")).andExpect(status().isCreated());
        enviarPost("/api/notas-entrada", nota(2001, fornA, hoje,
                ",\"condicaoPagamentoId\":" + condicao3060 + ",\"pedidoNumero\":1001,\"pedidoSerie\":1,\"pedidoModelo\":1",
                item(shampoo, classMercadoria, "10", "20", "0"))).andExpect(status().isCreated());
        enviarPost(url(2001, fornA) + "/confirmar", "").andExpect(status().isOk());

        for (String rota : List.of("produtos", "fornecedores", "condicoes-pagamento", "estoque", "notas-entrada",
                "pedidos-compra", "logs", "contas-pagar", "contas-receber", "classificacoes-conta", "transportadoras",
                "formas-pagamento", "parcelas", "clientes", "vendas", "funcionarios", "categorias", "marcas",
                "unidades-medida", "ncm-sh", "paises", "estados", "cidades", "agendamentos", "servicos",
                "notas-fiscais-saida", "notas-fiscais-servico")) {
            mvc.perform(get("/api/" + rota)).andExpect(status().isOk());
        }
        enviarGet("/api/produtos/" + shampoo).andExpect(status().isOk());
        enviarGet("/api/fornecedores/" + fornA).andExpect(status().isOk());
        enviarGet(url(2001, fornA)).andExpect(status().isOk())
                .andExpect(jsonPath("$.situacao").value("CONFERIDA"))
                .andExpect(jsonPath("$.pedido.numero").value(1001));
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

    private String url(int numero, long fornecedorId) {
        return "/api/notas-entrada/55/1/" + numero + "/" + fornecedorId;
    }

    private String nota(int numero, long fornecedorId, LocalDate emissao, String extras, String... itens) {
        return "{\"modelo\":55,\"serie\":1,\"numero\":" + numero + ",\"fornecedorId\":" + fornecedorId
                + ",\"dataEmissao\":\"" + emissao + "\"" + extras + ",\"itens\":[" + String.join(",", itens) + "]}";
    }

    private String item(long produtoId, long classificacaoId, String quantidade, String valorUnitario, String desconto) {
        return "{\"produtoId\":" + produtoId + ",\"classificacaoContaId\":" + classificacaoId
                + ",\"quantidade\":" + quantidade + ",\"valorUnitario\":" + valorUnitario
                + ",\"descontoPercentual\":" + desconto + "}";
    }

    // Itens no formato curto {"produtoId":..,"quantidade":..,"valorUnitario":..}: a classificação é acrescentada aqui
    private String pedido(int numero, long fornecedorId, String... itens) {
        return pedidoCompleto(numero, fornecedorId, "", itens);
    }

    private String pedidoCompleto(int numero, long fornecedorId, String extras, String... itens) {
        String comClassificacao = java.util.Arrays.stream(itens)
                .map(i -> i.contains("classificacaoContaId") ? i : i.replace("{", "{\"classificacaoContaId\":" + classMercadoria + ","))
                .collect(java.util.stream.Collectors.joining(","));
        return "{\"modelo\":1,\"serie\":1,\"numero\":" + numero + ",\"fornecedorId\":" + fornecedorId
                + ",\"dataPedido\":\"" + hoje + "\"" + extras + ",\"itens\":[" + comClassificacao + "]}";
    }

    private long id(String sql) {
        return jdbc.queryForObject(sql, Long.class);
    }

    private int count(String tabela) {
        return jdbc.queryForObject("select count(*) from " + tabela, Integer.class);
    }

    private int qtdEstoque(long produtoId) {
        return jdbc.queryForObject("select quantidade from produtos where id = ?", Integer.class, produtoId);
    }

    private String situacao(int numero, long fornecedorId) {
        return jdbc.queryForObject("select situacao from notas_entrada where numero = ? and fornecedor_id = ?",
                String.class, numero, fornecedorId);
    }

    private String situacaoPedido(int numero) {
        return jdbc.queryForObject("select situacao from pedidos_compra where numero = ?", String.class, numero);
    }

    private BigDecimal recebido(int numeroPedido, long produtoId) {
        return jdbc.queryForObject("select quantidade_recebida from pedidos_compra_itens where numero = ? and produto_id = ?",
                BigDecimal.class, numeroPedido, produtoId);
    }
}
