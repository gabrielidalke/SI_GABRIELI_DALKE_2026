# RELATÓRIO TÉCNICO — salao-frontend

## 1. VISÃO GERAL

### Framework e Versão

| Propriedade | Valor |
|---|---|
| Framework | React 19.2.4 com TypeScript 5.9.3 |
| Bundler | Vite 8.0.1 |
| Roteamento | React Router DOM 7.13.2 |
| HTTP Client | Axios 1.14.0 |
| Ícones | Lucide React 1.17.0 |
| Estilização | TailwindCSS 4.2.2 + estilos inline via `src/styles/theme.ts` |
| Versão do projeto | 0.0.0 (privado) |

### Estrutura de Pastas

```
salao-frontend/
  src/
    App.tsx                      — roteador principal
    components/
      Sidebar.tsx                — menu de navegação lateral
      CidadeAutocomplete.tsx     — autocomplete de cidades com busca por digitação
    pages/
      agendamento/
        AgendamentoPage.tsx
      categoria/
        CategoriaList.tsx
        CategoriaForm.tsx
      servico/
        ServicoList.tsx
        ServicoForm.tsx
      cliente/
        ClienteList.tsx
        ClienteForm.tsx
      funcionario/
        FuncionarioList.tsx
        FuncionarioForm.tsx
      fornecedor/
        FornecedorForm.tsx
      condicao/
        CondicaoPagamentoForm.tsx
      Produtos.tsx
      Marcas.tsx
      UnidadesMedida.tsx
      Fornecedores.tsx
      Paises.tsx
      Estados.tsx
      Cidades.tsx
      NcmSh.tsx
      FormasPagamento.tsx
      CondicoesPagamento.tsx
      Parcelas.tsx
      ContasPagar.tsx
      ContasReceber.tsx
      Compras.tsx
      NotasFiscaisEntrada.tsx
      Vendas.tsx
      NotasFiscaisSaida.tsx
      NotasFiscaisServico.tsx
    services/
      agendamentoService.ts
      clienteService.ts
      funcionarioService.ts
      fornecedorService.ts
      categoriaService.ts
      servicoService.ts
      produtoService.ts
      marcaService.ts
      unidadeMedidaService.ts
      ncmShService.ts
      formaPagamentoService.ts
      condicaoPagamentoService.ts
      parcelaService.ts
      contasPagarService.ts
      contasReceberService.ts
      estadoService.ts
      cidadeService.ts
      paisService.ts
      compraService.ts
      notaFiscalEntradaService.ts
      vendaService.ts
      notaFiscalSaidaService.ts
      notaFiscalServicoService.ts
    styles/
      theme.ts                   — tokens de estilo exportados como CSSProperties
```

### Comunicação com o Backend

- **Base URL:** `http://localhost:8080/api` (hardcoded em todos os serviços)
- **Protocolo:** REST sobre HTTP
- **Métodos HTTP utilizados:**
  - `GET` — listagem e busca por ID
  - `POST` — criação de registros e ações de negócio (confirmar, concluir, cancelar, pagar, receber, validar, gerar NF-e, gerar NFS-e)
  - `PUT` — atualização de registros
  - `DELETE` — exclusão de registros
- **Formato de dados:** JSON (padrão do Axios)
- **Tratamento de erros:** captura de `e?.response?.data?.mensagem` ou `e?.response?.data?.message`, exibindo-os via `setErro()` em banner inline ou via `alert()`

### Serviços e Endpoints

| Serviço | Base URL | Operações |
|---|---|---|
| agendamentoService | `/agendamentos` | GET (listar, buscar), POST (criar, confirmar, concluir, cancelar) |
| clienteService | `/clientes` | GET, POST, PUT, DELETE |
| funcionarioService | `/funcionarios` | GET, POST, PUT, DELETE |
| fornecedorService | `/fornecedores` | GET, POST, PUT, DELETE |
| categoriaService | `/categorias` | GET, POST, PUT, DELETE |
| servicoService | `/servicos` | GET, POST, PUT, DELETE |
| produtoService | `/produtos` | GET, POST, PUT, DELETE |
| marcaService | `/marcas` | GET, POST, PUT, DELETE |
| unidadeMedidaService | `/unidades-medida` | GET, POST, PUT, DELETE |
| ncmShService | `/ncm-sh` | GET, POST, PUT, DELETE |
| formaPagamentoService | `/formas-pagamento` | GET, POST, PUT, DELETE |
| condicaoPagamentoService | `/condicoes-pagamento` | GET, POST, PUT, DELETE |
| parcelaService | `/parcelas` | GET, POST, PUT, DELETE |
| contasPagarService | `/contas-pagar` | GET, POST (criar, pagar, cancelar), PUT, DELETE |
| contasReceberService | `/contas-receber` | GET, POST (criar, receber, cancelar), PUT, DELETE |
| estadoService | `/estados` | GET, POST, PUT, DELETE |
| cidadeService | `/cidades` | GET (listar, buscar, buscar por nome), POST, PUT, DELETE |
| paisService | `/paises` | GET, POST, PUT, DELETE |
| compraService | `/compras` | GET, POST (criar, validar, gerar-nfe, cancelar), PUT, DELETE |
| notaFiscalEntradaService | `/notas-fiscais-entrada` | GET, PUT (atualizar transporte) |
| vendaService | `/vendas` | GET, POST (criar, validar, gerar-nfe, cancelar), PUT, DELETE |
| notaFiscalSaidaService | `/notas-fiscais-saida` | GET, PUT (atualizar transporte) |
| notaFiscalServicoService | `/notas-fiscais-servico` | GET, POST (gerar a partir de agendamento) |

---

## 2. TELAS E MÓDULOS

### Módulo: Agendamentos

| Tela | Rota | Observação |
|---|---|---|
| Agenda diária + modal de cadastro/edição | `/agendamentos` | Combined: lista em cards e formulário modal no mesmo componente |

### Módulo: Clientes

| Tela | Rota |
|---|---|
| Listagem | `/clientes` |
| Cadastro | `/clientes/novo` |
| Edição | `/clientes/editar/:id` |

### Módulo: Funcionários

| Tela | Rota |
|---|---|
| Listagem | `/funcionarios` |
| Cadastro | `/funcionarios/novo` |
| Edição | `/funcionarios/:id` |

### Módulo: Serviços

| Tela | Rota |
|---|---|
| Listagem | `/servicos` |
| Cadastro | `/servicos/novo` |
| Edição | `/servicos/:id` |

### Módulo: Categorias

| Tela | Rota |
|---|---|
| Listagem | `/categorias` |
| Cadastro | `/categorias/nova` |
| Edição | `/categorias/:id` |

### Módulo: Produtos

| Tela | Rota | Observação |
|---|---|---|
| Combined: formulário + listagem | `/produtos` | Formulário no topo; tabela abaixo; editar rola até o formulário |

### Módulo: Marcas

| Tela | Rota | Observação |
|---|---|---|
| Combined: formulário + listagem | `/marcas` | Mesmo padrão de Produtos |

### Módulo: Unidades de Medida

| Tela | Rota | Observação |
|---|---|---|
| Combined: formulário + listagem | `/unidades-medida` | Mesmo padrão de Produtos |

### Módulo: Fornecedores

| Tela | Rota |
|---|---|
| Listagem | `/fornecedores` |
| Cadastro | `/fornecedores/novo` |
| Edição | `/fornecedores/editar/:id` |

### Módulo: Localização — Países

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição | `/paises` | Formulário em modal overlay |

### Módulo: Localização — Estados

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição | `/estados` | Formulário em modal overlay |

### Módulo: Localização — Cidades

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição | `/cidades` | Formulário em modal overlay |

### Módulo: Financeiro — Formas de Pagamento

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição | `/formas-pagamento` | Formulário em modal overlay |

### Módulo: Financeiro — Condições de Pagamento

| Tela | Rota |
|---|---|
| Listagem | `/condicoes-pagamento` |
| Cadastro | `/condicoes-pagamento/nova` |
| Edição | `/condicoes-pagamento/editar/:id` |

### Módulo: Financeiro — Parcelas

| Observação |
|---|
| Componente `Parcelas.tsx` existe mas **não está registrado como rota** em `App.tsx`. Não aparece no menu. Provavelmente auxiliar ou legado. |

### Módulo: Financeiro — Contas a Pagar

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição/visualização | `/contas-pagar` | Combined |

### Módulo: Financeiro — Contas a Receber

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição/visualização | `/contas-receber` | Combined |

### Módulo: Fiscal — NCM / SH

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição | `/ncm-sh` | Formulário em modal overlay |

### Módulo: Fiscal — Compras

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição/visualização | `/compras` | Combined com máquina de estados (RASCUNHO → VALIDADA → NFE_GERADA / CANCELADA) |

### Módulo: Fiscal — Notas Fiscais de Entrada

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal "Editar Transporte" | `/notas-fiscais-entrada` | Notas geradas automaticamente a partir de Compras; edição limitada a transportadora/placa |

### Módulo: Fiscal — Vendas

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de cadastro/edição/visualização | `/vendas` | Combined com máquina de estados espelhada ao de Compras |

### Módulo: Fiscal — Notas Fiscais de Saída

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal "Editar Transporte" | `/notas-fiscais-saida` | Notas geradas automaticamente a partir de Vendas |

### Módulo: Fiscal — Notas Fiscais de Serviço (NFS-e)

| Tela | Rota | Observação |
|---|---|---|
| Listagem + modal de detalhes (somente leitura) | `/notas-fiscais-servico` | NFS-e geradas automaticamente a partir de Agendamentos concluídos |

---

## 3. CAMPOS DE CADA TELA

### 3.1 Agendamentos — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Data e Hora | `datetime-local` | Sim (`*`) | — |
| Cliente | `select` | Sim (`*`) | Opções carregadas de `GET /clientes`; placeholder: "Selecione o cliente" |
| Funcionário | `select` | Sim (`*`) | Opções carregadas de `GET /funcionarios`; placeholder: "Selecione o funcionário" |
| Serviços | `checkbox` (múltipla seleção em lista scrollável) | Sim (`*`) | Opções carregadas de `GET /servicos`; exibe nome, duração (min) e preço; mínimo 1 selecionado |
| Valor Total | Calculado (readonly) | N/A | Soma dos preços dos serviços selecionados; formatado como `R$ X.XX` |
| Observação | `textarea` | Não | Placeholder: "Observações sobre o agendamento..." |

### 3.2 Categorias — Formulário (CategoriaForm)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Categoria | `text` | Sim (`*`) | Placeholder: "Nome da categoria..." |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.3 Serviços — Formulário (ServicoForm)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Serviço | `text` | Sim (`*`) | Placeholder: "Nome do serviço..." |
| Descrição | `text` | Não | Placeholder: "Descrição do serviço..." |
| Duração (min) | `number` | Sim (`*`) | Placeholder: "Ex: 60" |
| Preço (R$) | `number` | Sim (`*`) | Placeholder: "Ex: 80.00" |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.4 Produtos — Formulário inline (Produtos.tsx)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly; exibe ID em edição ou "(automático)" |
| Produto | `text` | Sim (`*`) | Placeholder: "Nome do produto..." |
| Categoria | `select` | Não | Opções de `GET /categorias`; exibe `nome`; placeholder: "Selecione" |
| Ativo | Toggle Sim/Não | Não | Default: `true` |
| Marca | `select` | Não | Opções de `GET /marcas`; exibe `marca`; placeholder: "Selecione" |
| Unidade de Medida | `select` | Não | Opções de `GET /unidades-medida`; exibe `"unidadeMedida (sigla)"`; placeholder: "Selecione" |
| NCM / SH | `select` | Não | Opções de `GET /ncm-sh`; exibe `"codigo — descricao"`; placeholder: "Selecione" |
| Valor Venda (R$) | `number` | Sim (`*`) | Placeholder: "Ex: 45.90" |
| Preço de Custo (R$) | `number` | Não | Placeholder: "Ex: 20.00" |
| Estoque | `number` | Não | Placeholder: "Ex: 10" |
| Desconto (%) | `number` | Não | Placeholder: "Ex: 5" |

### 3.5 Marcas — Formulário inline (Marcas.tsx)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly |
| Marca | `text` | Sim (`*`) | Placeholder: "Nome da marca..." |
| Ativo | Toggle Sim/Não | Não | Default: `true` |

### 3.6 Unidades de Medida — Formulário inline (UnidadesMedida.tsx)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly |
| Unidade de Medida | `text` | Sim (`*`) | Placeholder: "Ex: Unidade" |
| Sigla | `text` | Sim (`*`) | Placeholder: "Ex: UN" |
| Ativo | Toggle Sim/Não | Não | Default: `true` |

### 3.7 Clientes — Formulário (ClienteForm)

**Seção: Dados Principais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly |
| Tipo | `select` | Não | "Física" (`FISICA`), "Jurídica" (`JURIDICA`) |
| Cliente / Nome | `text` | Sim (`*`) | Placeholder: "Nome completo do cliente..." |
| Ativo | Toggle Sim/Não | Não | Default: `true` |

**Seção: Dados Pessoais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Apelido | `text` | Não | Placeholder: "Apelido" |
| Estado Civil | `select` | Não | "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)" |
| Sexo | `select` | Não | "Masculino" (`M`), "Feminino" (`F`) |
| Nacionalidade | `text` | Não | Placeholder: "Ex: Brasileira" |
| Data Nascimento | `date` | Não | — |

**Seção: Endereço**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Endereço | `text` | Sim (`*`) | Placeholder: "Rua, Avenida..." |
| Número | `text` | Sim (`*`) | Placeholder: "Nº" |
| CEP | `text` | Sim (`*`) | Placeholder: "00000-000" |
| Complemento | `text` | Não | Placeholder: "Apto, Bloco..." |
| Bairro | `text` | Sim (`*`) | Placeholder: "Bairro" |
| Cidade | `autocomplete` | Sim (`*`) | Componente `CidadeAutocomplete`; busca por digitação (mín. 2 chars), retorna até 10 sugestões de `GET /cidades/buscar?nome=...`; exibe "Cidade - UF" |

**Seção: Contato**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Telefone | `text` | Sim (`*`) | Placeholder: "(00) 00000-0000" |
| Contato | `text` | Não | Placeholder: "Nome do contato..." |
| Email | `text` | Sim (`*`) | Placeholder: "email@exemplo.com" |
| RG | `text` | Não | — |
| CPF | `text` | Não | Placeholder: "000.000.000-00" |

**Seção: Financeiro**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Condição de Pagamento | `select` | Não | Opções de `GET /condicoes-pagamento`; placeholder: "Selecione" |

**Seção: Observações**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| (sem label) | `textarea` | Não | Placeholder: "Observações sobre o cliente..." |

### 3.8 Funcionários — Formulário (FuncionarioForm)

**Seção: Endereço**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| CEP | `text` | Não | Placeholder: "00000-000" |
| Número | `text` | Não | Placeholder: "Nº" |
| Bairro | `text` | Não | Placeholder: "Bairro" |
| Endereço | `text` | Não | Placeholder: "Rua, Avenida..." |
| Complemento | `text` | Não | Placeholder: "Apto, Bloco..." |
| Cidade | `autocomplete` | Não | Componente `CidadeAutocomplete` |

**Seção: Contato**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Telefone | `text` | Sim (`*`) | Placeholder: "(00) 00000-0000" |
| Email | `text` | Sim (`*`) | Placeholder: "email@exemplo.com" |

**Seção: Dados Pessoais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Funcionário | `text` | Sim (`*`) | Placeholder: "Nome do funcionário..." |
| Apelido | `text` | Não | Placeholder: "Como é conhecido..." |
| CPF | `text` | Não | Placeholder: "000.000.000-00" |
| Data de Nascimento | `date` | Não | — |
| Sexo | `select` | Não | "Masculino" (`M`), "Feminino" (`F`) |
| Estado Civil | `select` | Não | "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)" |

**Seção: Dados Profissionais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Data de Admissão | `date` | Sim (`*`) | — |
| Data de Demissão | `date` | Não | — |
| Salário (R$) | `number` | Não | Placeholder: "Ex: 2000.00" |
| Comissão (%) | `number` | Não | Placeholder: "Ex: 30" |

**Seção: Observações**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| (sem label) | `textarea` | Não | Placeholder: "Observações sobre o funcionário..." |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.9 Fornecedores — Formulário (FornecedorForm)

**Seção: Dados Principais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly |
| Tipo | `select` | Não | "Física" (`FISICA`), "Jurídica" (`JURIDICA`) |
| Fornecedor / Nome | `text` | Sim (`*`) | Placeholder: "Nome da empresa ou pessoa..." |
| Ativo | Toggle Sim/Não | Não | Default: `true` |

**Seção: Dados da Empresa**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Nome Fantasia | `text` | Não | Placeholder: "Nome fantasia..." |
| Inscrição Estadual | `text` | Não | Placeholder: "IE" |
| Inscrição Municipal | `text` | Não | Placeholder: "IM" |

**Seção: Documentos**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| CPF / CNPJ | `text` | Não | Placeholder: "000.000.000-00 ou 00.000.000/0000-00" |
| RG / IE | `text` | Não | Placeholder: "RG ou Inscrição Estadual" |

**Seção: Endereço**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Endereço | `text` | Não | Placeholder: "Rua, Avenida..." |
| Número | `text` | Não | Placeholder: "Nº" |
| CEP | `text` | Não | Placeholder: "00000-000" |
| Complemento | `text` | Não | Placeholder: "Apto, Bloco..." |
| Bairro | `text` | Não | Placeholder: "Bairro" |
| Cidade | `autocomplete` | Não | Componente `CidadeAutocomplete` |

**Seção: Contato**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Telefone | `text` | Não | Placeholder: "(00) 0000-0000" |
| Celular | `text` | Não | Placeholder: "(00) 00000-0000" |
| Email | `text` | Não | Placeholder: "email@fornecedor.com" |
| Contato | `text` | Não | Placeholder: "Nome da pessoa de contato" |
| Site | `text` | Não | Placeholder: "www.fornecedor.com.br" |

**Seção: Financeiro**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Condição de Pagamento | `select` | Não | Opções de `GET /condicoes-pagamento`; placeholder: "Selecione" |

**Seção: Observações**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| (sem label) | `textarea` | Não | Placeholder: "Observações sobre o fornecedor..." |

### 3.10 Países — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| País | `text` | Sim (`*`) | Placeholder: "Nome do país..." |
| Sigla | `text` | Sim (`*`) | Placeholder: "Ex: BR"; `maxLength={3}`; convertida para maiúsculas automaticamente |
| Moeda | `text` | Não | Placeholder: "Ex: Real" |
| Nacionalidade | `text` | Não | Placeholder: "Ex: Brasileiro" |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.11 Estados — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Estado | `text` | Sim (`*`) | Placeholder: "Nome do estado..." |
| UF | `text` | Sim (`*`) | Placeholder: "Ex: SP"; `maxLength={2}`; convertida para maiúsculas automaticamente |
| País | `select` | Não | Opções de `GET /paises`; exibidas como "nome (sigla)" |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.12 Cidades — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Cidade | `text` | Sim (`*`) | Placeholder: "Nome da cidade..." |
| Estado | `select` | Não | Opções de `GET /estados`; exibidas como "nome (UF)" |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.13 NCM / SH — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` | Sim (`*`) | Placeholder: "Ex: 3304.99.90" |
| Descrição | `text` | Não | Placeholder: "Descrição do NCM/SH..." |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.14 Formas de Pagamento — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Forma de Pagamento | `text` | Sim (`*`) | Placeholder: "Ex: Cartão de Crédito, PIX, Dinheiro..." |
| Percentual (%) | `number` | Não | Placeholder: "Ex: 2.50"; `min=0`, `max=100`, `step=0.01` |
| Nº Dias | `number` | Não | Placeholder: "Ex: 30"; `min=0` |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.15 Condições de Pagamento — Formulário (CondicaoPagamentoForm)

**Dados gerais**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Código | `text` (desabilitado) | N/A | Readonly; exibe "(auto)" para novo |
| Condição Pgto | `text` | Sim (`*`) | Placeholder: "Ex: 30/60/90 Dias Boleto" |
| Multa % | `number` | Não | Placeholder: "0,00"; `min=0`, `max=100`, `step=0.01` |
| Juro % | `number` | Não | Placeholder: "0"; `min=0`, `max=100`, `step=0.01` |
| Desconto % | `number` | Não | Placeholder: "0,00"; `min=0`, `max=100`, `step=0.01` |

**Subformulário de Parcelas** (dinâmico via botão "+ Adicionar Parcela")

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Dias para Vencimento | `number` | Sim (`*`) | Placeholder: "Ex: 30"; `min=0` |
| Percentual | `number` | Sim (`*`) | Placeholder: "Ex: 100"; `min=0`, `max=100`, `step=0.01` |
| Forma de Pagamento | `select` | Sim (`*`) | Opções de `GET /formas-pagamento` |

> Validação especial: o total dos percentuais das parcelas deve somar exatamente 100%. O rodapé da tabela exibe o total em verde (`✓ Percentual correto`) ou vermelho (`⚠ Deve somar 100%`).

### 3.16 Parcelas — Modal de Cadastro/Edição (componente sem rota registrada)

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Número de Dias | `number` | Sim (`*`) | Placeholder: "Ex: 30"; `min=0` |
| Forma de Pagamento | `select` | Sim (`*`) | Opções de `GET /formas-pagamento`; placeholder: "Selecione a forma de pagamento" |
| Condição de Pagamento | `select` | Sim (`*`) | Opções de `GET /condicoes-pagamento`; placeholder: "Selecione a condição de pagamento" |
| Ativo | `checkbox` | Não | Default: `true` |

### 3.17 Contas a Pagar — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Descrição | `text` | Sim (`*`) | Placeholder: "Descreva a conta a pagar..." |
| Valor (R$) | `number` | Sim (`*`) | Placeholder: "0,00"; `min=0`, `step=0.01` |
| Data de Vencimento | `date` | Sim (`*`) | — |
| Fornecedor | `select` | Não | Opções de `GET /fornecedores`; placeholder: "Selecione o fornecedor" |
| Parcela | `select` | Não | Opções de `GET /parcelas`; exibidas como "Nº dias: X"; placeholder: "Selecione a parcela" |
| Ativo | `checkbox` | Não | Default: `true` |

> Em modo visualização (situação PAGA), todos os campos ficam desabilitados (`disabled`).

### 3.18 Contas a Receber — Modal de Cadastro/Edição

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Descrição | `text` | Sim (`*`) | Placeholder: "Descreva a conta a receber..." |
| Valor (R$) | `number` | Sim (`*`) | Placeholder: "0,00"; `min=0`, `step=0.01` |
| Data de Vencimento | `date` | Sim (`*`) | — |
| Cliente | `select` | Não | Opções de `GET /clientes`; placeholder: "Selecione o cliente" |
| Parcela | `select` | Não | Opções de `GET /parcelas`; exibidas como "Nº dias: X"; placeholder: "Selecione a parcela" |
| Ativo | `checkbox` | Não | Default: `true` |

> Em modo visualização (situação RECEBIDA), todos os campos ficam desabilitados.

### 3.19 Compras — Modal de Cadastro/Edição

**Dados da compra**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Nº Compra | `text` | Sim (`*`) | Placeholder: "Ex: C-2024-001" |
| Data | `date` | Sim (`*`) | — |
| Fornecedor | `select` | Não | Opções de `GET /fornecedores`; placeholder: "Selecione o fornecedor" |
| Observação | `textarea` | Não | Placeholder: "Observações sobre a compra..." |

**Itens da compra** (dinâmico via "+ Adicionar Item")

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Produto | `select` | Sim (`*`) | Opções de `GET /produtos`; placeholder: "Selecione" |
| Quantidade | `number` | Sim | `min=1`, `step=1` |
| Preço Unit. (R$) | `number` | Sim | `min=0`, `step=0.01`; preenchido automaticamente com `precoVenda` do produto selecionado |
| Subtotal | Calculado (readonly) | N/A | `quantidade × precoUnitario` |
| Total Geral | Calculado (readonly) | N/A | Soma de todos os subtotais |

### 3.20 Notas Fiscais de Entrada — Modal "Editar Transporte"

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Transportadora | `text` | Não | Placeholder: "Nome da transportadora..." |
| Placa do Veículo | `text` | Não | Placeholder: "Ex: ABC-1234" |

### 3.21 Vendas — Modal de Cadastro/Edição

**Dados da venda**

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Nº Venda | `text` | Sim (`*`) | Placeholder: "Ex: V-2024-001" |
| Data | `date` | Sim (`*`) | — |
| Cliente | `select` | Não | Opções de `GET /clientes`; placeholder: "Selecione o cliente" |
| Observação | `textarea` | Não | Placeholder: "Observações sobre a venda..." |

**Itens da venda** (dinâmico via "+ Adicionar Item")

| Campo | Tipo | Obrigatório | Valores / Observação |
|---|---|---|---|
| Produto | `select` | Sim (`*`) | Opções de `GET /produtos`; placeholder: "Selecione" |
| Quantidade | `number` | Sim | `min=1`, `step=1` |
| Preço Unit. (R$) | `number` | Sim | `min=0`, `step=0.01`; preenchido automaticamente |
| Subtotal | Calculado (readonly) | N/A | — |
| Total Geral | Calculado (readonly) | N/A | — |

### 3.22 Notas Fiscais de Saída — Modal "Editar Transporte"

Idêntico ao modal de Notas Fiscais de Entrada (seção 3.20).

### 3.23 Notas Fiscais de Serviço — Modal "Detalhes da NFS-e"

Somente visualização. Exibe: Nº Nota, Data Emissão, Cliente, Serviços (lista), Valor Total. Apenas botão "Fechar".

---

## 4. COLUNAS DAS TELAS DE LISTAGEM

### 4.1 Agendamentos (`/agendamentos`)

Não é uma tabela. Exibe **cards**, filtrados por data, com os seguintes dados:

| Dado | Observação |
|---|---|
| Hora | Extraída do campo `dataHora` |
| Nome do cliente | — |
| Serviços | Lista separada por vírgulas |
| Nome do funcionário | — |
| Valor total | Formatado como `R$ X.XX` |
| Badge de status | AGENDADO / CONFIRMADO / CONCLUÍDO / CANCELADO |
| Botões de ação | Variáveis por status (ver seção 5.1) |

### 4.2 Categorias (`/categorias`)

| Coluna | Observação |
|---|---|
| ID | — |
| Categoria | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.3 Serviços (`/servicos`)

| Coluna | Observação |
|---|---|
| ID | — |
| Serviço | — |
| Duração | Valor + "min" |
| Preço | `R$ X.XX` |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.4 Produtos (`/produtos`)

| Coluna | Observação |
|---|---|
| Código | — |
| Produto | — |
| Categoria | — |
| Marca | — |
| Valor | Formatado como moeda BRL via `Intl.NumberFormat` |
| Estoque | — |
| Ativo | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.5 Marcas (`/marcas`)

| Coluna | Observação |
|---|---|
| Marca | — |
| Ativo | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.6 Unidades de Medida (`/unidades-medida`)

| Coluna | Observação |
|---|---|
| Unidade de Medida | — |
| Sigla | Fonte monospace |
| Ativo | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.7 Clientes (`/clientes`)

| Coluna | Observação |
|---|---|
| ID | — |
| Cliente | — |
| Telefone | — |
| Email | — |
| CPF | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.8 Funcionários (`/funcionarios`)

| Coluna | Observação |
|---|---|
| ID | — |
| Funcionário | — |
| Telefone | — |
| Email | — |
| Admissão | — |
| Comissão | Valor + "%" |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.9 Fornecedores (`/fornecedores`)

| Coluna | Observação |
|---|---|
| ID | — |
| Fornecedor | Nome principal; nome fantasia exibido abaixo em texto menor |
| CPF/CNPJ | — |
| Telefone | Prioriza `fone`, depois `celular` |
| Cidade | "cidade - UF" |
| Condição Pgto | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.10 Países (`/paises`)

| Coluna | Observação |
|---|---|
| ID | — |
| País | — |
| Sigla | — |
| Nacionalidade | — |
| Moeda | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.11 Estados (`/estados`)

| Coluna | Observação |
|---|---|
| ID | — |
| Estado | — |
| UF | — |
| País | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.12 Cidades (`/cidades`)

| Coluna | Observação |
|---|---|
| ID | — |
| Cidade | — |
| Estado | — |
| UF | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.13 NCM / SH (`/ncm-sh`)

| Coluna | Observação |
|---|---|
| ID | — |
| Código | Fonte monospace |
| Descrição | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.14 Formas de Pagamento (`/formas-pagamento`)

| Coluna | Observação |
|---|---|
| ID | — |
| Forma de Pagamento | — |
| Percentual (%) | Valor + "%" |
| Nº Dias | — |
| Status | Badge Ativo / Inativo |
| Ações | "Editar", "Excluir" |

### 4.15 Condições de Pagamento (`/condicoes-pagamento`)

| Coluna | Observação |
|---|---|
| ID | — |
| Condição | — |
| Multa (%) | Valor + "%" |
| Juros (%) | Valor + "%" |
| Desconto (%) | Valor + "%" |
| Nº Parcelas | Contagem de parcelas associadas (badge) |
| Ações | "Editar", "Excluir" |

### 4.16 Contas a Pagar (`/contas-pagar`)

| Coluna | Observação |
|---|---|
| ID | — |
| Descrição | — |
| Fornecedor | — |
| Valor (R$) | `R$ X.XX` |
| Vencimento | — |
| Situação | Badge ABERTA / PAGA / CANCELADA |
| Ações | Variáveis por situação (ver seção 5.13) |

### 4.17 Contas a Receber (`/contas-receber`)

| Coluna | Observação |
|---|---|
| ID | — |
| Descrição | — |
| Cliente | — |
| Valor (R$) | `R$ X.XX` |
| Vencimento | — |
| Situação | Badge ABERTA / RECEBIDA / CANCELADA |
| Ações | Variáveis por situação (ver seção 5.14) |

### 4.18 Compras (`/compras`)

| Coluna | Observação |
|---|---|
| Nº Compra | — |
| Data | — |
| Fornecedor | — |
| Valor Total (R$) | `R$ X.XX` |
| Status | Badge RASCUNHO / VALIDADA / NF-e Gerada / CANCELADA |
| Ações | Variáveis por status (ver seção 5.16) |

### 4.19 Notas Fiscais de Entrada (`/notas-fiscais-entrada`)

| Coluna | Observação |
|---|---|
| Nº Nota | — |
| Série | — |
| Data Emissão | Formato pt-BR com hora |
| Fornecedor | — |
| Valor Total (R$) | `R$ X.XX` |
| Transportadora | — |
| Placa | — |
| Ações | "Editar Transporte" |

### 4.20 Vendas (`/vendas`)

| Coluna | Observação |
|---|---|
| Nº Venda | — |
| Data | — |
| Cliente | — |
| Valor Total (R$) | `R$ X.XX` |
| Status | Badge RASCUNHO / VALIDADA / NF-e Gerada / CANCELADA |
| Ações | Variáveis por status (ver seção 5.18) |

### 4.21 Notas Fiscais de Saída (`/notas-fiscais-saida`)

| Coluna | Observação |
|---|---|
| Nº Nota | — |
| Série | — |
| Data Emissão | Formato pt-BR com hora |
| Cliente | — |
| Valor Total (R$) | `R$ X.XX` |
| Transportadora | — |
| Placa | — |
| Ações | "Editar Transporte" |

### 4.22 Notas Fiscais de Serviço (`/notas-fiscais-servico`)

| Coluna | Observação |
|---|---|
| Nº Nota | — |
| Data Emissão | Formato pt-BR com hora |
| Cliente | — |
| Serviços | Lista separada por vírgulas; truncado com ellipsis |
| Valor Total (R$) | `R$ X.XX` |
| Ações | "Ver" |

---

## 5. FLUXO DE INTERAÇÃO DO USUÁRIO

### 5.1 Agendamentos

**Acesso:** menu lateral → item "Agendamentos" (ícone Calendar)

**Filtro de data:** seletor no topo; ao alterar a data a lista é recarregada automaticamente via `useEffect([data])`.

**Botão "+ Novo Agendamento":** abre modal com formulário vazio.

**Salvar:** valida todos os campos obrigatórios; exibe banner de erro em caso de falha; fecha modal e recarrega lista em caso de sucesso.

**Cancelar (modal):** fecha o modal sem salvar.

**Ações por status do agendamento:**

| Status | Botões disponíveis |
|---|---|
| AGENDADO | "Confirmar", "Editar", "Cancelar" |
| CONFIRMADO | "Concluir", "Cancelar" |
| CONCLUIDO | "Ver", "Gerar NFS-e" (ou badge "NFS-e Emitida" se já gerada) |
| CANCELADO | "Ver" |

- **Confirmar:** chama `POST /agendamentos/{id}/confirmar`; sem confirmação prévia
- **Concluir:** chama `POST /agendamentos/{id}/concluir`; sem confirmação prévia
- **Cancelar:** chama `POST /agendamentos/{id}/cancelar`; sem confirmação prévia
- **Gerar NFS-e:** chama `POST /notas-fiscais-servico/gerar/{agendamentoId}`; falha exibe `alert()`

### 5.2 Categorias

**Acesso:** menu lateral → "Categorias" (ícone Tag)

**Botão "+ Nova Categoria":** navega para `/categorias/nova`

**Botão "Editar":** navega para `/categorias/:id`

**Botão "Excluir":** abre `confirm('Deseja excluir esta categoria?')`; se confirmado chama `DELETE /categorias/{id}`

**Botão "Voltar":** navega para `/categorias`

### 5.3 Serviços

**Acesso:** menu lateral → "Serviços" (ícone Scissors)

Fluxo idêntico ao de Categorias, com rotas `/servicos/novo` e `/servicos/:id`.

**Botão "Excluir":** abre `confirm('Deseja excluir este serviço?')`

### 5.4 Produtos

**Acesso:** menu lateral → "Produtos" (ícone Package)

**Botão "+ Novo Produto":** rola a página até o formulário (scroll suave) e limpa os campos.

**Botão "Editar":** rola até o formulário e preenche os campos com os dados do produto.

**Botão "Salvar Produto" / "Atualizar Produto":** valida campos obrigatórios; em sucesso limpa o formulário e recarrega a tabela.

**Busca:** campo de texto + botão "Pesquisar" (ou Enter); filtra por nome, marca ou categoria.

**Botão "Excluir":** abre `confirm('Deseja excluir este produto?')`

### 5.5 Marcas

**Acesso:** menu lateral → "Marcas" (ícone Tag)

Mesmo padrão de Produtos (formulário + lista na mesma tela; scroll para formulário ao editar).

**Botão "Excluir":** abre `confirm('Deseja excluir esta marca?')`

### 5.6 Unidades de Medida

**Acesso:** menu lateral → "Unidades de Medida" (ícone Ruler)

Mesmo padrão de Marcas.

**Botão "Excluir":** abre `confirm('Deseja excluir esta unidade de medida?')`

### 5.7 Clientes

**Acesso:** menu lateral → "Clientes" (ícone Users)

**Botão "+ Novo Cliente":** navega para `/clientes/novo`

**Botão "Editar":** navega para `/clientes/editar/:id`

**Botão "Excluir":** abre `confirm('Deseja excluir este cliente?')`

**Botão "Salvar Cliente":** chama `POST` ou `PUT`; em falha exibe `alert()`; em sucesso navega para `/clientes`

### 5.8 Funcionários

**Acesso:** menu lateral → "Funcionários" (ícone UserCheck)

Fluxo idêntico ao de Clientes (rotas `/funcionarios/novo`, `/funcionarios/:id`).

**Botão "Excluir":** abre `confirm('Deseja excluir este funcionário?')`

**Botões "Salvar" e "Voltar"**

### 5.9 Fornecedores

**Acesso:** menu lateral → "Fornecedores" (ícone Truck)

Fluxo idêntico ao de Clientes (rotas `/fornecedores/novo`, `/fornecedores/editar/:id`).

**Botão "Excluir":** abre `confirm('Deseja excluir este fornecedor?')`

**Botão "Salvar Fornecedor"**

### 5.10 Países / Estados / Cidades

**Acesso:** menu lateral → grupo "Localização" (colapsável, ícone MapPin) → "Países", "Estados" ou "Cidades"

**Botão "+ Novo País / + Novo Estado / + Nova Cidade":** abre modal com formulário vazio

**Botão "Editar":** abre modal preenchido com os dados do registro

**Botão "Excluir" (Países):** abre `confirm('Deseja excluir este país?')`

**Botão "Excluir" (Estados):** abre `confirm('Deseja excluir este estado?')`

**Botão "Excluir" (Cidades):** abre `confirm('Deseja excluir esta cidade?')`

**Botão "Salvar":** valida campos obrigatórios; exibe `erroBanner` em caso de erro; fecha modal e recarrega lista em sucesso

**Botão "Cancelar":** fecha o modal

### 5.11 Formas de Pagamento

**Acesso:** menu lateral → grupo "Financeiro" (ícone CreditCard) → "Formas de Pgto"

**Botão "+ Nova Forma de Pagamento":** abre modal

**Botão "Excluir":** abre `confirm('Deseja excluir esta forma de pagamento?')`

**Botões "Salvar" / "Cancelar":** comportamento padrão de modal

### 5.12 Condições de Pagamento

**Acesso:** menu lateral → grupo "Financeiro" → "Condições de Pgto"

**Botão "+ Nova Condição":** navega para `/condicoes-pagamento/nova`

**Botão "Editar":** navega para `/condicoes-pagamento/editar/:id`

**Botão "Excluir":** abre `confirm('Deseja excluir esta condição de pagamento?')`

**Botão "+ Adicionar Parcela":** insere nova linha na tabela de parcelas

**Botão de exclusão de parcela (🗑):** remove a linha da tabela

**Botão "Salvar Condição":** valida campos obrigatórios e dias das parcelas; exibe total percentual (verde/vermelho, mas não bloqueia salvar se diferente de 100%); em sucesso navega para `/condicoes-pagamento`

### 5.13 Contas a Pagar

**Acesso:** menu lateral → grupo "Financeiro" → "Contas a Pagar"

**Botão "+ Nova Conta a Pagar":** abre modal de cadastro

**Ações por situação:**

| Situação | Botões |
|---|---|
| ABERTA | "Pagar", "Cancelar", "Editar" |
| PAGA | "Ver" (modal somente leitura) |
| CANCELADA | "Excluir" |

- **Pagar:** abre `confirm('Confirmar pagamento desta conta?')`; chama `POST /contas-pagar/{id}/pagar`
- **Cancelar:** abre `confirm('Cancelar esta conta a pagar?')`; chama `POST /contas-pagar/{id}/cancelar`
- **Excluir:** abre `confirm('Excluir definitivamente esta conta?')`; chama `DELETE`

### 5.14 Contas a Receber

**Acesso:** menu lateral → grupo "Financeiro" → "Contas a Receber"

Fluxo espelhado ao de Contas a Pagar.

| Situação | Botões |
|---|---|
| ABERTA | "Receber", "Cancelar", "Editar" |
| RECEBIDA | "Ver" |
| CANCELADA | "Excluir" |

- **Receber:** abre `confirm('Confirmar recebimento desta conta?')`; chama `POST /contas-receber/{id}/receber`
- **Cancelar:** abre `confirm('Cancelar esta conta a receber?')`
- **Excluir:** abre `confirm('Excluir definitivamente esta conta?')`

### 5.15 NCM / SH

**Acesso:** menu lateral → grupo "Fiscal" (ícone FileText) → "NCM / SH"

**Botão "+ Novo NCM/SH":** abre modal

**Botão "Excluir":** abre `confirm('Deseja excluir este NCM/SH?')`

**Botão "✕" no cabeçalho do modal:** fecha modal

### 5.16 Compras

**Acesso:** menu lateral → grupo "Fiscal" → "Compras"

**Botão "+ Nova Compra":** abre modal com formulário vazio e um item inicial

**Ações por status:**

| Status | Botões |
|---|---|
| RASCUNHO | "Editar", "Validar", "Cancelar" |
| VALIDADA | "Ver", "Gerar NF-e", "Cancelar" |
| NFE_GERADA | "Ver", "Ver NF-e" |
| CANCELADA | "Ver" |

- **Validar:** abre `confirm('Validar esta compra?')`; chama `POST /compras/{id}/validar`
- **Gerar NF-e:** abre `confirm('Gerar NF-e para esta compra?')`; chama `POST /compras/{id}/gerar-nfe`
- **Cancelar:** abre `confirm('Cancelar esta compra?')`; chama `POST /compras/{id}/cancelar`
- **Ver NF-e:** navega para `/notas-fiscais-entrada`

**Botão "+ Adicionar Item":** adiciona linha de produto

**Botão "✕" por linha de item:** remove a linha

### 5.17 Notas Fiscais de Entrada

**Acesso:** menu lateral → grupo "Fiscal" → "Notas Fiscais Entrada"

Tela somente leitura. Notas criadas automaticamente via "Gerar NF-e" em Compras.

**Botão "Editar Transporte":** abre modal para editar transportadora e placa do veículo

### 5.18 Vendas

**Acesso:** menu lateral → grupo "Fiscal" → "Vendas"

Fluxo espelhado ao de Compras.

| Status | Botões |
|---|---|
| RASCUNHO | "Editar", "Validar", "Cancelar" |
| VALIDADA | "Ver", "Gerar NF-e", "Cancelar" |
| NFE_GERADA | "Ver", "Ver NF-e" |
| CANCELADA | "Ver" |

- **Ver NF-e:** navega para `/notas-fiscais-saida`

### 5.19 Notas Fiscais de Saída

**Acesso:** menu lateral → grupo "Fiscal" → "Notas Fiscais de Saída"

Idêntico ao fluxo de Notas Fiscais de Entrada.

### 5.20 Notas Fiscais de Serviço

**Acesso:** menu lateral → grupo "Fiscal" → "Notas Fiscais de Serviço"

Tela somente leitura. NFS-e criadas a partir de "Gerar NFS-e" na tela de Agendamentos (apenas para status CONCLUIDO).

**Botão "Ver":** abre modal com detalhes da nota. Apenas botão "Fechar".

---

## 6. VALIDAÇÕES E MENSAGENS DE ERRO

### Validações frontend — mensagens inline (setErro)

| Módulo | Mensagem exata |
|---|---|
| Agendamentos | `'Preencha data/hora, cliente, funcionário e pelo menos um serviço.'` |
| Produtos | `'Nome do produto é obrigatório.'` |
| Produtos | `'Valor de venda é obrigatório.'` |
| Marcas | `'Nome da marca é obrigatório.'` |
| Unidades de Medida | `'Nome da unidade é obrigatório.'` |
| Unidades de Medida | `'Sigla é obrigatória.'` |
| Países | `'Nome e sigla são obrigatórios.'` |
| Estados | `'Nome e UF são obrigatórios.'` |
| Cidades | `'Nome é obrigatório.'` |
| NCM/SH | `'Código é obrigatório.'` |
| Formas de Pagamento | `'Nome é obrigatório.'` |
| Condições de Pagamento | `'Condição de pagamento é obrigatória.'` |
| Condições de Pagamento | `'Dias deve ser maior ou igual a zero.'` |
| Parcelas | `'Número de dias é obrigatório.'` |
| Parcelas | `'Selecione a forma de pagamento.'` |
| Parcelas | `'Selecione a condição de pagamento.'` |
| Contas a Pagar | `'Descrição é obrigatória.'` |
| Contas a Pagar | `'Valor deve ser maior que zero.'` |
| Contas a Pagar | `'Data de vencimento é obrigatória.'` |
| Contas a Receber | `'Descrição é obrigatória.'` |
| Contas a Receber | `'Valor deve ser maior que zero.'` |
| Contas a Receber | `'Data de vencimento é obrigatória.'` |
| Compras | `'Nº Compra é obrigatório.'` |
| Compras | `'Data é obrigatória.'` |
| Compras | `'Adicione pelo menos um item.'` |
| Compras | `'Selecione o produto em todos os itens.'` |
| Vendas | `'Nº Venda é obrigatório.'` |
| Vendas | `'Data é obrigatória.'` |
| Vendas | `'Adicione pelo menos um item.'` |
| Vendas | `'Selecione o produto em todos os itens.'` |
| Fornecedores | `'Nome do fornecedor é obrigatório.'` |

### Mensagens de erro do backend — padrão de fallback (alert)

Todas as ações que falham exibem a mensagem retornada pelo backend via:
```
e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao [ação].'
```

| Ação | Mensagem de fallback |
|---|---|
| Agendamentos — ações de status | `'Erro.'` |
| Agendamentos — gerar NFS-e | `'Erro ao gerar NFS-e.'` |
| Excluir (categorias, serviços, etc.) | `'Erro ao excluir.'` |
| Salvar (produtos, marcas, etc.) | `'Erro ao salvar.'` |
| Pagar conta | `'Erro ao registrar pagamento.'` |
| Receber conta | `'Erro ao registrar recebimento.'` |
| Cancelar conta | `'Erro ao cancelar.'` |
| Validar compra/venda | `'Erro ao validar.'` |
| Gerar NF-e | `'Erro ao gerar NF-e.'` |
| Cancelar compra/venda | `'Erro ao cancelar.'` |

### Confirmações (confirm)

| Módulo / Ação | Texto exato |
|---|---|
| Categorias — excluir | `'Deseja excluir esta categoria?'` |
| Serviços — excluir | `'Deseja excluir este serviço?'` |
| Produtos — excluir | `'Deseja excluir este produto?'` |
| Marcas — excluir | `'Deseja excluir esta marca?'` |
| Unidades de Medida — excluir | `'Deseja excluir esta unidade de medida?'` |
| Clientes — excluir | `'Deseja excluir este cliente?'` |
| Funcionários — excluir | `'Deseja excluir este funcionário?'` |
| Fornecedores — excluir | `'Deseja excluir este fornecedor?'` |
| Países — excluir | `'Deseja excluir este país?'` |
| Estados — excluir | `'Deseja excluir este estado?'` |
| Cidades — excluir | `'Deseja excluir esta cidade?'` |
| NCM/SH — excluir | `'Deseja excluir este NCM/SH?'` |
| Formas de Pagamento — excluir | `'Deseja excluir esta forma de pagamento?'` |
| Condições de Pagamento — excluir | `'Deseja excluir esta condição de pagamento?'` |
| Parcelas — excluir | `'Deseja excluir esta parcela?'` |
| Contas a Pagar — pagar | `'Confirmar pagamento desta conta?'` |
| Contas a Pagar — cancelar | `'Cancelar esta conta a pagar?'` |
| Contas a Pagar — excluir | `'Excluir definitivamente esta conta?'` |
| Contas a Receber — receber | `'Confirmar recebimento desta conta?'` |
| Contas a Receber — cancelar | `'Cancelar esta conta a receber?'` |
| Contas a Receber — excluir | `'Excluir definitivamente esta conta?'` |
| Compras — validar | `'Validar esta compra?'` |
| Compras — gerar NF-e | `'Gerar NF-e para esta compra?'` |
| Compras — cancelar | `'Cancelar esta compra?'` |
| Vendas — validar | `'Validar esta venda?'` |
| Vendas — gerar NF-e | `'Gerar NF-e para esta venda?'` |
| Vendas — cancelar | `'Cancelar esta venda?'` |

### Indicadores visuais de validação

| Condição | Indicador |
|---|---|
| Percentual de parcelas igual a 100% | Span verde: `✓ Percentual correto` |
| Percentual de parcelas diferente de 100% | Span vermelho: `⚠ Deve somar 100%` |

---

## 7. NAVEGAÇÃO / MENU

O menu lateral (`Sidebar.tsx`) é fixo à esquerda, com largura de 220px e fundo branco. Marca exibida no topo: **"✦ Salão Bella — Sistema de Gestão"**.

### Itens principais (sem grupo)

| Label | Rota | Ícone (Lucide) |
|---|---|---|
| Agendamentos | `/agendamentos` | Calendar |
| Clientes | `/clientes` | Users |
| Funcionários | `/funcionarios` | UserCheck |
| Serviços | `/servicos` | Scissors |
| Produtos | `/produtos` | Package |
| Categorias | `/categorias` | Tag |
| Marcas | `/marcas` | Tag |
| Unidades de Medida | `/unidades-medida` | Ruler |
| Fornecedores | `/fornecedores` | Truck |

### Grupo "Financeiro" (colapsável, ícone CreditCard)

| Label | Rota | Ícone |
|---|---|---|
| Formas de Pgto | `/formas-pagamento` | — |
| Condições de Pgto | `/condicoes-pagamento` | — |
| Contas a Pagar | `/contas-pagar` | ArrowDownCircle |
| Contas a Receber | `/contas-receber` | ArrowUpCircle |

### Grupo "Localização" (colapsável, ícone MapPin)

| Label | Rota |
|---|---|
| Países | `/paises` |
| Estados | `/estados` |
| Cidades | `/cidades` |

### Grupo "Fiscal" (colapsável, ícone FileText)

| Label | Rota |
|---|---|
| Compras | `/compras` |
| Notas Fiscais Entrada | `/notas-fiscais-entrada` |
| Vendas | `/vendas` |
| Notas Fiscais de Saída | `/notas-fiscais-saida` |
| Notas Fiscais de Serviço | `/notas-fiscais-servico` |
| NCM / SH | `/ncm-sh` |

### Comportamentos do menu

- **Grupos colapsáveis:** o estado inicial de cada grupo é determinado verificando se a rota atual (`location.pathname`) começa com alguma das rotas do grupo — o grupo abre automaticamente quando o usuário está em uma de suas rotas.
- **Item ativo:** marcado quando `location.pathname.startsWith(path)` retorna `true`.
- **Rota raiz:** `/` redireciona automaticamente para `/agendamentos` via `<Navigate to="/agendamentos" />`.
