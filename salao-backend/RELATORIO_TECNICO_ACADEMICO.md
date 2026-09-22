# Relatório Técnico Completo — Sistema de Gestão de Salão (salao-backend)

> Documento gerado a partir da leitura integral do código-fonte em
> `C:\Users\dalke\Documents\projeto-salao\salao-backend\src\main\java\com\salao`.
> Reflete o estado **atual em disco**, incluindo alterações ainda não commitadas
> nos módulos `cliente`, `compra`, `financeiro`, `fornecedor`, `funcionario`,
> `pagamento` e `produto`.

---

## 1. VISÃO GERAL

### 1.1 Identificação do projeto
- **Nome**: Salão (pacote base `com.salao`, artifactId Maven `salao`)
- **Descrição funcional**: sistema de gestão para salão de beleza — cadastros
  gerais (geografia, categorias, marcas, unidades de medida, NCM/SH),
  cadastro de pessoas (clientes, funcionários, fornecedores), produtos e
  serviços, agendamentos com máquina de estados, condições/formas de
  pagamento, contas a pagar/receber, compras e vendas com itens, e emissão
  simulada de notas fiscais (entrada, saída e serviço/NFS-e).
- **Linguagem**: Java 17
- **Framework**: Spring Boot 4.0.5 (`spring-boot-starter-parent`)
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-validation`
  - `spring-boot-starter-webmvc`
  - `spring-boot-starter-data-jpa-test`, `-validation-test`, `-webmvc-test` (escopo teste)
- **Persistência/ORM**: Spring Data JPA + Hibernate
- **Banco de dados**: PostgreSQL (driver `org.postgresql:postgresql`, escopo runtime)
- **Migrações**: Flyway (`flyway-core` + `flyway-database-postgresql`) presente
  no `pom.xml`, porém **desabilitado** em `application.properties`
  (`spring.flyway.enabled=false`)
- **Estratégia de schema**: `spring.jpa.hibernate.ddl-auto=validate` — o
  Hibernate apenas valida se o schema já existente é compatível com as
  entidades; não cria nem altera tabelas automaticamente
- **Build**: Maven (wrapper `mvnw`)
- **Geração de código**: Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`,
  `@AllArgsConstructor`), dependência opcional
- **Porta HTTP**: 8080 (`server.port=8080`)
- **CORS**: liberado explicitamente apenas para `http://localhost:5173`
  (origem do frontend em desenvolvimento), todos os métodos e headers
  (`CorsConfig.java`)
- **Detalhamento de erros HTTP**: `server.error.include-message=always`,
  `server.error.include-binding-errors=always`

### 1.2 Arquitetura geral

Arquitetura em camadas, organizada por **módulo de domínio** (não por camada
técnica), sob `com.salao.modules.<nome>`. Cada módulo tipicamente contém:

```
com.salao.modules.<entidade>
 ├── <Entidade>.java              → Entidade JPA (@Entity)
 ├── <Entidade>Controller.java    → Camada REST (@RestController)
 ├── <Entidade>Service.java       → Regras de negócio (@Service)
 ├── <Entidade>Repository.java    → Acesso a dados (Spring Data JPA)
 ├── <Entidade>RequestDTO.java    → DTO de entrada (record, com Bean Validation)
 └── <Entidade>ResponseDTO.java   → DTO de saída (record, com from(entidade))
```

Fluxo padrão de uma requisição:
```
Cliente HTTP → Controller (@RestController)
             → Service (@Service, regras de negócio, transações)
             → Repository (Spring Data JPA, interface)
             → Hibernate/JPA → PostgreSQL
```

Camada transversal de configuração (`com.salao.config`):
- `CorsConfig` — libera CORS para o frontend.
- `GlobalExceptionHandler` (`@RestControllerAdvice`) — intercepta **toda**
  `RuntimeException` lançada por qualquer service e converte para
  **HTTP 400 Bad Request**, respondendo em JSON no formato
  `{"mensagem": "<mensagem da exceção>"}`. Este é o único mecanismo de
  tratamento de erro de negócio do sistema — não há hierarquia de exceções
  customizadas nem uso de `@ResponseStatus` nas exceções.

Utilitário transversal: `com.salao.util.CpfCnpjValidator` — validação de
CPF/CNPJ por algoritmo de dígito verificador (módulo 11), usado por
`ClienteService`, `FuncionarioService` e `FornecedorService`.

**Padrões observados de forma consistente na maioria dos módulos** (exceções
pontuais indicadas nas seções de regras de negócio):
- Uso de **DTOs record** (Java `record`) para request/response, com Bean
  Validation (`@NotBlank`, `@NotNull`, `@Size`, `@Positive`, `@NotEmpty`).
- Métodos estáticos `from(Entidade e)` nos Response DTOs para mapeamento.
- Timestamps automáticos via `@CreationTimestamp` (`criadoEm`/`dataCriacao`)
  e `@UpdateTimestamp` (`atualizadoEm`/`dataAtualizacao`).
- Campo `ativo` (Boolean) com default `true` via `@Builder.Default`,
  representando soft-flag de ativação (mas **não** soft-delete — exclusões
  são físicas via `deleteById`, exceto quando bloqueadas por regra de
  negócio).
- Máquinas de estado implementadas como `String` comparada via `.equals()`,
  **não** como `enum` Java (Agendamento, Compra, Venda, ContasPagar,
  ContasReceber).
- POST → 201 Created; DELETE → 204 No Content; GET/PUT → 200 OK (default).

**Exceções ao padrão** (divergências arquiteturais relevantes,
documentadas em detalhe nas seções seguintes):
- `Categoria`, `Cliente`, `Funcionario` e `Servico` **não** têm Response DTO
  dedicado — o Controller/Service expõe a **entidade JPA diretamente**.
- `Categoria` usa um DTO único (`CategoriaDTO`) para request, sem separação
  Request/Response.
- `Cliente` e `Funcionario` também usam DTO único (`ClienteDTO`,
  `FuncionarioDTO`) sem separação Request/Response.

### 1.3 Módulos vs. tabelas (visão de banco de dados)

O banco é PostgreSQL, referenciado por `spring.datasource.url` como
`salao_db`. Como o Flyway está desabilitado e `ddl-auto=validate`, as tabelas
precisam existir previamente por fora do versionamento (schema.sql legado ou
ajuste manual). Migrations Flyway existentes (não executadas
automaticamente): `V10` a `V33` (paises, estados, cidades, agendamentos,
formas/condições de pagamento, parcelas, fornecedores, contas a
pagar/receber, ncm_sh, compras/itens, notas fiscais de entrada, vendas/itens,
notas fiscais de saída e de serviço).

**Divergências conhecidas entre migrations SQL e entidades JPA atuais**
(relevantes para a documentação, pois representam débito técnico real do
projeto):
1. Tabelas `marcas` e `unidades_medida` (e colunas `produtos.marca_id` /
   `produtos.unidade_medida_id`) são usadas pelas entidades JPA mas **não
   têm script SQL de criação** em nenhuma migration.
2. `V10__create_paises.sql` cria a coluna `pais`, mas a entidade `Pais` usa a
   coluna `nome` — divergência de nome de coluna. Mesmo padrão de
   divergência de nomes de timestamp (`data_criacao`/`data_atualizacao` vs.
   `criado_em`/`atualizado_em`) se repete em `estados` e `cidades`; `cidades`
   também não tem `codigo_ibge` na migration.
3. `V22__create_fornecedores.sql` cria apenas `id, fornecedor, ativo` e
   timestamps — sem `cpf_cnpj`, `endereco`, `bairro`, `cep`, `fone`,
   `inscricao_estadual`, `cidade_id` e `condicao_pagamento_id`, todos usados
   pela entidade `Fornecedor` atual.
4. `V20__create_condicoes_pagamento.sql` **não cria a coluna `juro`**,
   adicionada recentemente à entidade `CondicaoPagamento` (alteração ainda
   não commitada). `V21__create_parcelas.sql` cria apenas `numero_dias`,
   enquanto a entidade `Parcela` atual usa dois campos separados,
   `numero_parcela` e `dias_vencimento` (alteração recente, sem migration
   correspondente) — a aplicação falhará em runtime contra um banco criado
   estritamente a partir dessas migrations até que sejam corrigidas/uma nova
   migration seja criada.

---

## 2. ENTIDADES E MODELO DE DADOS

> Legenda de colunas: **Obrig.** = coluna `NOT NULL` no banco (via
> `@Column(nullable=false)`) e/ou `@NotNull`/`@NotBlank` no DTO de entrada.
> **Tam.** = tamanho máximo (`length`) ou precisão/escala (`precision,scale`)
> quando aplicável. **Default** = valor padrão aplicado pela entidade
> (`@Builder.Default`) e/ou pela lógica do Service quando o campo vem nulo
> do request.

### 2.1 `Pais` (tabela `paises`)

| Campo | Tipo | Obrig. | Tam. | Default | Observações |
|---|---|---|---|---|---|
| `id` | Long | PK | — | auto (IDENTITY) | |
| `nome` | String | sim | 100 | — | `@NotBlank` no DTO |
| `sigla` | String | sim | 3 | — | `unique=true`; convertida para **uppercase** antes de salvar; `@NotBlank` |
| `nacionalidade` | String | não | 100 | — | |
| `moeda` | String | não | 50 | — | |
| `ativo` | Boolean | não | — | `true` | mantido se omitido na atualização |
| `dataCriacao` | LocalDateTime | — | — | auto | `@CreationTimestamp` |
| `dataAtualizacao` | LocalDateTime | — | — | auto | `@UpdateTimestamp` |

Relacionamentos: **1:N** com `Estado` (inverso; FK `estados.pais_id`, não
mapeado como coleção do lado de `Pais`). Sem enum/status de máquina de
estados (apenas flag `ativo`).

### 2.2 `Estado` (tabela `estados`)

| Campo | Tipo | Obrig. | Tam. | Default | Observações |
|---|---|---|---|---|---|
| `id` | Long | PK | — | auto | |
| `nome` | String | sim | 100 | — | `@NotBlank` |
| `uf` | String | sim | 2 | — | `unique=true`; convertida para **uppercase** |
| `pais` | Pais (FK `pais_id`) | não | — | null | `@ManyToOne`, fetch EAGER (padrão) |
| `ativo` | Boolean | não | — | `true` | |
| `dataCriacao` / `dataAtualizacao` | LocalDateTime | — | — | auto | |

Relacionamentos: **N:1** com `Pais` (opcional); **1:N** com `Cidade`
(inverso).

### 2.3 `Cidade` (tabela `cidades`)

| Campo | Tipo | Obrig. | Tam. | Default | Observações |
|---|---|---|---|---|---|
| `id` | Long | PK | — | auto | |
| `nome` | String | sim | 100 | — | `@NotBlank` |
| `codigoIbge` | String | não | 10 | — | **inacessível via API** (não existe em nenhum DTO request/response) |
| `estado` | Estado (FK `estado_id`) | não | — | null | `@ManyToOne`, fetch EAGER |
| `ativo` | Boolean | não | — | `true` | |
| `dataCriacao` / `dataAtualizacao` | LocalDateTime | — | — | auto | |

Relacionamentos: **N:1** com `Estado` (opcional); referenciada por `Cliente`,
`Funcionario` e `Fornecedor` via `cidade_id` (N:1 do lado deles).

### 2.4 `Categoria` (tabela `categorias`)

| Campo | Tipo | Obrig. | Tam. | Default | Observações |
|---|---|---|---|---|---|
| `id` | Long | PK | — | auto | |
| `nome` | String | sim | 60 | — | `unique=true` no banco; `@NotBlank @Size(min=3,max=60)` no DTO; duplicidade checada (case-insensitive) só na criação |
| `ativo` | Boolean | não | — | `true` na criação | na atualização é setado **sem checagem de nulo** (pode virar `null`) |
| `dataCriacao` / `dataAtualizacao` | LocalDateTime | — | — | auto | |

Sem relacionamentos com outras entidades no código atual (nenhuma FK
aponta para `Categoria`, apesar do nome do módulo sugerir uso futuro em
`Produto`).

### 2.5 `Marca` (tabela `marcas`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `marca` | String | sim (`@Column nullable=false`, mas sem `unique`) | 100 | — |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **1:N** com `Produto` (inverso, via `produtos.marca_id`).

### 2.6 `UnidadeMedida` (tabela `unidades_medida`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `unidadeMedida` | String | sim | 100 | — |
| `sigla` | String | sim | 10 | — |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **1:N** com `Produto` (inverso).

### 2.7 `NcmSh` (tabela `ncm_sh`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `codigo` | String | sim | 20 | — | `unique=true` no banco, sem checagem de duplicidade amigável no service |
| `descricao` | String | não | 200 | — |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **1:N** com `Produto` (inverso).

### 2.8 `Produto` (tabela `produtos`)

| Campo | Tipo | Obrig. | Tam. | Default | Observações |
|---|---|---|---|---|---|
| `id` | Long | PK | — | auto | |
| `nome` | String | sim | 100 | — | `unique=true`; `@NotBlank`; duplicidade (case-insensitive) checada só na criação |
| `descricao` | String | não | 255 | — | |
| `precoVenda` | BigDecimal | sim | (10,2) | — | `@NotNull @Positive` no DTO |
| `precoCusto` | BigDecimal | não | (10,2) | — | |
| `desconto` | BigDecimal | não | (5,2) | `BigDecimal.ZERO` na criação; mantido se omitido na atualização | |
| `quantidade` | Integer | não | — | `0` na criação; sobrescrito sem checagem de nulo na atualização | representa estoque, mas nunca é debitado/creditado por Compra/Venda |
| `ativo` | Boolean | não | — | `true` | |
| `ncmSh` | NcmSh (FK `ncm_sh_id`) | não | — | null | vínculo opcional; se id informado e inexistente → erro |
| `marca` | Marca (FK `marca_id`) | não | — | null | idem |
| `unidadeMedida` | UnidadeMedida (FK `unidade_medida_id`) | não | — | null | idem |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto | |

Relacionamentos: **N:1** com `NcmSh`, `Marca`, `UnidadeMedida` (todos
opcionais); referenciado por `CompraItem`/`VendaItem` (N:1 do lado deles).

### 2.9 `Cliente` (tabela `clientes`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `nome` | String | sim | 50 | — |
| `apelido` | String | não | 60 | — |
| `email` | String | não | 100 | — |
| `telefone` | String | não | 20 | — |
| `endereco` | String | não | 200 | — |
| `numero` | String | não | 5 | — |
| `complemento` | String | não | 100 | — |
| `bairro` | String | não | 50 | — |
| `cep` | String | não | 9 | — |
| `cpf` | String | não | 14 | — | `unique=true`; validado por `CpfCnpjValidator` se informado |
| `rg` | String | não | 14 | — |
| `dataNascimento` | LocalDate | não | — | — |
| `sexo` | String | não | 1 | — |
| `estadoCivil` | String | não | 20 | — |
| `observacao` | String | não | 255 | — |
| `cidade` | Cidade (FK `cidade_id`) | não | — | null | vínculo **tolerante**: id inexistente → cliente salvo sem cidade (sem erro) |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:1** com `Cidade` (opcional, tolerante); referenciado
por `Agendamento`, `ContasReceber`, `NotaFiscalSaida`, `NotaFiscalServico` e
`Venda` (N:1 do lado deles).

### 2.10 `Funcionario` (tabela `funcionarios`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `nome` | String | sim | 100 | — |
| `apelido` | String | não | 60 | — |
| `email` | String | sim | 100 | — |
| `telefone` | String | sim | 20 | — |
| `cpf` | String | não | 14 | — | `unique=true`; validado se informado |
| `dataNascimento` | LocalDate | não | — | — |
| `dataAdmissao` | LocalDate | sim | — | — | `@NotNull` |
| `dataDemissao` | LocalDate | não | — | — |
| `sexo` | String | não | 1 | — |
| `estadoCivil` | String | não | 20 | — |
| `endereco` | String | não | 200 | — |
| `numero` | String | não | 5 | — |
| `complemento` | String | não | 100 | — |
| `bairro` | String | não | 50 | — |
| `cep` | String | não | 9 | — |
| `cidade` | Cidade (FK `cidade_id`) | não | — | null | **campo "morto"**: existe na entidade, mas ausente no DTO e no Service — sempre `null` via API |
| `salario` | BigDecimal | não | — | — |
| `percentualComissao` | BigDecimal | não | — | `BigDecimal.ZERO` na criação; sem fallback na atualização (pode virar `null`) |
| `observacao` | String | não | 255 | — |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:1** com `Cidade` (inacessível via API); referenciado
por `Agendamento` (N:1 do lado deste).

### 2.11 `Fornecedor` (tabela `fornecedores`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `fornecedor` | String | sim (`@Column`), sem `@NotBlank` na entidade | 150 | — | `@NotBlank` no DTO |
| `cpfCnpj` | String | não | 18 | — | sem `unique`; validado como CPF (11 díg.) ou CNPJ (demais casos) se informado; **sem checagem de duplicidade** |
| `endereco` | String | não | 200 | — |
| `bairro` | String | não | 100 | — |
| `cep` | String | não | 20 | — |
| `fone` | String | não | 20 | — |
| `inscricaoEstadual` | String | não | 30 | — |
| `cidade` | Cidade (FK `cidade_id`) | não | — | null | vínculo **não tolerante**: id inexistente → erro |
| `condicaoPagamento` | CondicaoPagamento (FK `condicao_pagamento_id`) | não | — | null | idem |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:1** com `Cidade` e com `CondicaoPagamento` (ambos
opcionais, não tolerantes); referenciado por `Compra`, `ContasPagar` e
`NotaFiscalEntrada` (N:1 do lado deles).

### 2.12 `Servico` (tabela `servicos`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `nome` | String | sim | 60 | — | `unique=true`; duplicidade checada (case-insensitive) só na criação |
| `descricao` | String | não | 255 | — |
| `duracaoMin` | Integer | sim | — | — | `@NotNull @Positive` |
| `preco` | BigDecimal | sim | — | — | `@NotNull @Positive` |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:N** com `Agendamento` (lado não-dono; ver `Agendamento`
para detalhes da tabela associativa).

### 2.13 `Agendamento` (tabela `agendamentos`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `dataHora` | LocalDateTime | sim | — | — | `@NotNull` no DTO |
| `observacao` | String | não | 500 | — |
| `status` | String | sim | 20 | `"AGENDADO"` | máquina de estados (ver §3) |
| `valorTotal` | BigDecimal | não | (10,2) | calculado | soma dos preços dos serviços vinculados, sempre recalculado no backend |
| `cliente` | Cliente (FK `cliente_id`) | sim (regra de negócio) | — | — | `@NotNull` no DTO (`clienteId`) |
| `funcionario` | Funcionario (FK `funcionario_id`) | sim | — | — | `@NotNull` no DTO (`funcionarioId`) |
| `servicos` | List\<Servico\> | sim (ao menos 1) | — | — | `@NotEmpty` no DTO (`servicoIds`); **N:N** via tabela `agendamento_servicos` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

**Relacionamento N:N `Agendamento` ↔ `Servico`**: implementado via
`@ManyToMany` **unidirecional** (`Agendamento` é o lado dono; `Servico` não
tem coleção inversa). Tabela associativa `agendamento_servicos`:
```sql
agendamento_servicos (
  agendamento_id BIGINT NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
  servico_id     BIGINT NOT NULL REFERENCES servicos(id),
  PRIMARY KEY (agendamento_id, servico_id)
)
```
Chave primária composta; `ON DELETE CASCADE` apenas do lado do agendamento.

Referenciado por `NotaFiscalServico` (1:1).

### 2.14 `FormaPagamento` (tabela `formas_pagamento`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `formaPagamento` | String | sim | 100 | — | `@NotBlank`; duplicidade checada (case-sensitive, `existsByFormaPagamento`) |
| `percentual` | BigDecimal | não | (5,2) | `BigDecimal.ZERO` |
| `numeroDias` | Integer | não | — | `0` |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **1:N** com `Parcela` (inverso).

### 2.15 `CondicaoPagamento` (tabela `condicoes_pagamento`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `condicao` | String | sim | 100 | — | `@NotBlank`; duplicidade checada (`existsByCondicao`) |
| `multa` | BigDecimal | não | (5,2) | `BigDecimal.ZERO` |
| `juro` | BigDecimal | não | (5,2) | `BigDecimal.ZERO` | **campo novo, sem migration correspondente** |
| `desconto` | BigDecimal | não | (5,2) | `BigDecimal.ZERO` |
| `ativo` | Boolean | não | — | `true` |
| `parcelas` | List\<Parcela\> | não | — | `new ArrayList<>()` | `@OneToMany(mappedBy="condicaoPagamento", cascade=ALL, orphanRemoval=true)` — **campo novo** |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **1:N** com `Parcela` (dono da composição — cascade total +
orphan removal: excluir a condição exclui todas as parcelas; atualizar
substitui integralmente as parcelas). Referenciada por `Fornecedor` (N:1).

### 2.16 `Parcela` (tabela `parcelas`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `numeroParcela` | Integer | não | — | — | **campo novo/renomeado**, opcional, sem migration |
| `diasVencimento` | Integer | sim | — | — | `@NotNull`; **renomeado de `numeroDias`**, sem migration correspondente |
| `formaPagamento` | FormaPagamento (FK `forma_pagamento_id`) | não | — | null | opcional |
| `condicaoPagamento` | CondicaoPagamento (FK `condicao_pagamento_id`) | não | — | null | opcional |
| `ativo` | Boolean | não | — | `true` |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:1** com `FormaPagamento` e com `CondicaoPagamento`
(ambos opcionais). Referenciada por `ContasPagar` e `ContasReceber` (N:1).
Pode ser criada tanto via CRUD próprio (`/api/parcelas`) quanto embutida no
payload de `CondicaoPagamento`.

### 2.17 `ContasPagar` (tabela `contas_pagar`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `descricao` | String | não | 200 | — |
| `valor` | BigDecimal | sim | (10,2) | — | `@NotNull` |
| `dataVencimento` | LocalDate | sim | — | — | `@NotNull` |
| `dataPagamento` | LocalDate | não | — | preenchida ao pagar (`LocalDate.now()`) |
| `situacao` | String | sim | 20 | `"ABERTA"` | máquina de estados |
| `fornecedor` | Fornecedor (FK `fornecedor_id`) | sim | — | — | `@NotNull` (`fornecedorId`) |
| `parcela` | Parcela (FK `parcela_id`) | não | — | null | opcional |
| `ativo` | Boolean | não | — | `true` | **campo morto**: nunca alterado, não usado em regra |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

Relacionamentos: **N:1** com `Fornecedor` (obrigatório) e `Parcela`
(opcional).

### 2.18 `ContasReceber` (tabela `contas_receber`)

Espelho de `ContasPagar`, trocando `fornecedor`→`cliente` e
`dataPagamento`→`dataRecebimento`:

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `descricao` | String | não | 200 | — |
| `valor` | BigDecimal | sim | (10,2) | — |
| `dataVencimento` | LocalDate | sim | — | — |
| `dataRecebimento` | LocalDate | não | — | preenchida ao receber |
| `situacao` | String | sim | 20 | `"ABERTA"` |
| `cliente` | Cliente (FK `cliente_id`) | sim | — | — |
| `parcela` | Parcela (FK `parcela_id`) | não | — | null |
| `ativo` | Boolean | não | — | `true` | campo morto |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

### 2.19 `Compra` (tabela `compras`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `numeroCompra` | String | não (unique) | 20 | — |
| `dataCompra` | LocalDate | sim | — | — | `@NotNull` |
| `valorTotal` | BigDecimal | não | (10,2) | `BigDecimal.ZERO`, sempre recalculado |
| `observacao` | String | não | 500 | — |
| `status` | String | não | 20 | `"RASCUNHO"` | máquina de estados |
| `fornecedor` | Fornecedor (FK `fornecedor_id`) | sim (regra) | — | — | `@NotNull` (`fornecedorId`) |
| `itens` | List\<CompraItem\> | sim (≥1 para validar) | — | `new ArrayList<>()` | `@OneToMany(mappedBy="compra", cascade=ALL, orphanRemoval=true)`; `@NotEmpty` no DTO |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

### 2.20 `CompraItem` (tabela `compra_itens`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `quantidade` | BigDecimal | sim | (10,3) | — | `@NotNull` no DTO |
| `precoUnitario` | BigDecimal | sim | (10,2) | — | `@NotNull` |
| `subtotal` | BigDecimal | sim | (10,2) | calculado (`quantidade × precoUnitario`) |
| `compra` | Compra (FK `compra_id NOT NULL`) | sim | — | — | `@ManyToOne` |
| `produto` | Produto (FK `produto_id`) | sim (regra) | — | — | `@NotNull` (`produtoId`) no DTO |

### 2.21 `Venda` (tabela `vendas`) — espelho de `Compra`

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `numeroVenda` | String | não (unique) | 20 | — |
| `dataVenda` | LocalDate | sim | — | — |
| `valorTotal` | BigDecimal | não | (10,2) | `ZERO`, recalculado |
| `observacao` | String | não | 500 | — |
| `status` | String | não | 20 | `"RASCUNHO"` |
| `cliente` | Cliente (FK `cliente_id`) | sim | — | — |
| `itens` | List\<VendaItem\> | sim (≥1 para validar) | — | `new ArrayList<>()` | cascade ALL + orphanRemoval |
| `criadoEm` / `atualizadoEm` | LocalDateTime | — | — | auto |

### 2.22 `VendaItem` (tabela `venda_itens`) — espelho de `CompraItem`

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `quantidade` | BigDecimal | sim | (10,3) | — |
| `precoUnitario` | BigDecimal | sim | (10,2) | — |
| `subtotal` | BigDecimal | sim | (10,2) | calculado |
| `venda` | Venda (FK `venda_id NOT NULL`) | sim | — | — |
| `produto` | Produto (FK `produto_id`) | sim | — | — |

### 2.23 `NotaFiscalEntrada` (tabela `notas_fiscais_entrada`)

| Campo | Tipo | Obrig. | Tam. | Default |
|---|---|---|---|---|
| `id` | Long | PK | — | auto |
| `numeroNota` | String | — | 20 | gerado: `"NFE-" + id (6 dígitos)` |
| `serie` | String | — | 5 | fixo `"1"` |
| `dataEmissao` | LocalDateTime | — | — | auto (`@CreationTimestamp`) |
| `chaveAcesso` | String | — | 50 | **nunca preenchido** (sempre `null`) |
| `valorTotal` | BigDecimal | — | (10,2) | copiado de `Compra.valorTotal` |
| `transportadoraNome` | String | — | 150 | atualizável via endpoint próprio |
| `veiculoPlaca` | String | — | 10 | idem |
| `observacao` | String | — | 500 | — |
| `compra` | Compra (FK `compra_id`) | — | — | **1:1** |
| `fornecedor` | Fornecedor (FK `fornecedor_id`) | — | — | copiado de `Compra.fornecedor` |

### 2.24 `NotaFiscalSaida` (tabela `notas_fiscais_saida`) — espelho de `NotaFiscalEntrada`

| Campo | Tipo | Default |
|---|---|---|
| (id, serie, dataEmissao, chaveAcesso, valorTotal, transportadoraNome, veiculoPlaca, observacao) | idênticos a `NotaFiscalEntrada` | — |
| `numeroNota` | String | gerado: `"NFS-" + id (6 dígitos)` |
| `venda` | Venda (FK `venda_id`) | **1:1** |
| `cliente` | Cliente (FK `cliente_id`) | copiado de `Venda.cliente` |

### 2.25 `NotaFiscalServico` (tabela `notas_fiscais_servico`) — NFS-e

| Campo | Tipo | Default |
|---|---|---|
| `id` | Long | auto |
| `numeroNota` | String | gerado: `"NFSE-" + id (6 dígitos)` |
| `serie` | String | fixo `"1"` |
| `dataEmissao` | LocalDateTime | auto |
| `valorTotal` | BigDecimal | copiado de `Agendamento.valorTotal` |
| `observacao` | String | — |
| `agendamento` | Agendamento (FK `agendamento_id`) | **1:1**, com checagem explícita de duplicidade (`existsByAgendamentoId`) |
| `cliente` | Cliente (FK `cliente_id`) | copiado de `Agendamento.cliente` |

Sem campos de transporte (não se aplica a serviço).

### 2.26 Resumo de relacionamentos (cardinalidade)

```
Estado          N:1  Pais
Cidade          N:1  Estado
Cliente         N:1  Cidade                (opcional, tolerante)
Funcionario     N:1  Cidade                (opcional, inacessível via API)
Fornecedor      N:1  Cidade                (opcional, não tolerante)
Fornecedor      N:1  CondicaoPagamento     (opcional, não tolerante)
Produto         N:1  NcmSh / Marca / UnidadeMedida  (opcionais)
Agendamento     N:1  Cliente
Agendamento     N:1  Funcionario
Agendamento     N:N  Servico               (via agendamento_servicos)
Parcela         N:1  FormaPagamento        (opcional)
Parcela         N:1  CondicaoPagamento     (opcional)
CondicaoPagamento 1:N Parcela              (composição: cascade ALL + orphanRemoval)
ContasPagar     N:1  Fornecedor
ContasPagar     N:1  Parcela               (opcional)
ContasReceber   N:1  Cliente
ContasReceber   N:1  Parcela               (opcional)
Compra          N:1  Fornecedor
Compra          1:N  CompraItem            (composição: cascade ALL + orphanRemoval)
CompraItem      N:1  Produto
Venda           N:1  Cliente
Venda           1:N  VendaItem             (composição: cascade ALL + orphanRemoval)
VendaItem       N:1  Produto
NotaFiscalEntrada 1:1 Compra
NotaFiscalEntrada N:1 Fornecedor
NotaFiscalSaida 1:1  Venda
NotaFiscalSaida N:1  Cliente
NotaFiscalServico 1:1 Agendamento
NotaFiscalServico N:1 Cliente
```

### 2.27 Enums / campos de status (todos implementados como `String`, sem `enum` Java)

| Entidade | Campo | Valores possíveis |
|---|---|---|
| `Agendamento` | `status` | `AGENDADO`, `CONFIRMADO`, `CONCLUIDO`, `CANCELADO` |
| `Compra` | `status` | `RASCUNHO`, `VALIDADA`, `NFE_GERADA`, `CANCELADA` |
| `Venda` | `status` | `RASCUNHO`, `VALIDADA`, `NFE_GERADA`, `CANCELADA` |
| `ContasPagar` | `situacao` | `ABERTA`, `PAGA`, `CANCELADA` |
| `ContasReceber` | `situacao` | `ABERTA`, `RECEBIDA`, `CANCELADA` |

Todas as demais entidades usam apenas o flag booleano `ativo`
(sem máquina de estados).

---

## 3. REGRAS DE NEGÓCIO

### 3.1 Pais
- Sigla convertida para uppercase antes de salvar.
- Sigla única: `"Sigla já cadastrada para outro país"` (checagem
  `existsBySigla`/`existsBySiglaAndIdNot`, ignorando o próprio id na
  atualização).
- Bloqueia exclusão se houver estados vinculados:
  `"Não é possível excluir: o país possui estados vinculados"`.
- `"País não encontrado"` para id inexistente em busca/atualização/exclusão.

### 3.2 Estado
- UF convertida para uppercase; única: `"UF já cadastrada para outro
  estado"`.
- Vínculo com País opcional; **na criação**, id de país inexistente lança
  `"País não encontrado"`; **na atualização**, o mesmo cenário é **ignorado
  silenciosamente** (assimetria de comportamento entre criar/atualizar).
- Bloqueia exclusão se houver cidades vinculadas: `"Não é possível excluir:
  o estado possui cidades vinculadas"`.
- `"Estado não encontrado"` para id inexistente.

### 3.3 Cidade
- Sem validação de duplicidade de nome.
- Vínculo com Estado opcional; mesma assimetria de `Estado`/`Pais`: na
  criação, id de estado inexistente lança `"Estado não encontrado"`; na
  atualização, é ignorado silenciosamente.
- Bloqueia exclusão se houver clientes vinculados: `"Não é possível
  excluir: a cidade possui clientes vinculados"` — **não valida** vínculo
  com funcionários nem fornecedores, apesar de ambos referenciarem cidade.
- `"Cidade não encontrada"` para id inexistente.

### 3.4 Categoria
- Nome único (case-insensitive) checado **apenas na criação**:
  `"Categoria já cadastrada"`. Na atualização, não há checagem de
  duplicidade (`existsByNomeIgnoreCase` não é reusado com exclusão do
  próprio id).
- `ativo` na atualização é setado sem checagem de nulo (pode gravar `null`).
- **Sem** verificação de vínculo antes de excluir (única entidade dentre os
  cadastros básicos sem essa proteção) e **sem** checagem de existência
  prévia no `deletar` — se o id não existir, o Spring Data lança
  `EmptyResultDataAccessException` não tratada (500, e não 400 amigável).
- Única entidade que expõe a **entidade JPA diretamente** na API (sem
  Response DTO).

### 3.5 Marca
- Sem validação de duplicidade de nome (a coluna nem é `unique`).
- Bloqueia exclusão se houver produtos vinculados: `"Não é possível
  excluir: existem produtos vinculados a esta marca"`.
- `"Marca não encontrada"` para id inexistente.

### 3.6 Unidade de Medida
- Sem validação de duplicidade.
- Bloqueia exclusão se houver produtos vinculados: `"Não é possível
  excluir: existem produtos vinculados a esta unidade de medida"`.
- `"Unidade de medida não encontrada"` para id inexistente (no
  `ProdutoService`, a mensagem equivalente apresenta um bug de codificação
  de caracteres no arquivo-fonte, exibindo o "ã" corrompido — mojibake,
  não um erro funcional).

### 3.7 NCM/SH
- Coluna `codigo` é `unique` no banco, mas **sem checagem de duplicidade em
  nível de aplicação** (uma tentativa de código duplicado resultaria em
  erro de integridade do banco, não numa mensagem de negócio amigável).
- Bloqueia exclusão se houver produtos vinculados: `"NCM/SH possui produtos
  vinculados e não pode ser excluído"` (única mensagem que foge do padrão
  "Não é possível excluir: ...").
- `"NCM/SH não encontrado"` para id inexistente.

### 3.8 Produto
- Nome único (case-insensitive), checado **apenas na criação**:
  `"Produto já cadastrado"`. Na atualização, é possível renomear para um
  nome já existente sem erro de aplicação (só falharia por constraint do
  banco).
- `desconto`: default `BigDecimal.ZERO` na criação se omitido; na
  atualização, só é sobrescrito se vier não nulo (mantém valor anterior
  caso contrário).
- `quantidade` e `ativo`: sobrescritos sem checagem de nulo na atualização
  (podem virar `null`).
- Vínculos opcionais com `NcmSh`, `Marca`, `UnidadeMedida`: se id informado
  e inexistente, lançam respectivamente `"NCM/SH não encontrado"`, `"Marca
  não encontrada"`, `"Unidade de medida não encontrada"`.
- **Sem** validação de vínculo com itens de compra/venda ao excluir (risco
  de erro de integridade do banco se o produto já tiver sido usado).
- Estoque (`quantidade`) **nunca é debitado/creditado automaticamente** por
  Compra ou Venda.

### 3.9 Cliente
- CPF (opcional) validado por `CpfCnpjValidator.validarCPF`:
  `"CPF inválido."` se inválido (aplicado em criar e atualizar).
- CPF único **checado apenas na criação**: `"CPF já cadastrado"` (não
  revalidado na atualização).
- Vínculo com Cidade **opcional e tolerante**: id inexistente na criação →
  cliente salvo sem cidade (sem erro); na atualização, se o id não existir,
  a cidade **atual permanece inalterada** (não é zerada).
- `ativo` sobrescrito sem checagem de nulo na atualização.
- **Sem** validação de vínculo ao excluir (agendamentos, contas a receber,
  notas fiscais e vendas referenciam cliente sem tratamento amigável de
  erro — risco de erro de integridade do banco).
- Retorna a **entidade JPA diretamente** (sem Response DTO).

### 3.10 Funcionário
- CPF (opcional) validado da mesma forma que Cliente: `"CPF inválido."`.
- CPF único checado apenas na criação: `"CPF já cadastrado"`.
- `percentualComissao`: default `BigDecimal.ZERO` na criação se omitido;
  **sem fallback** na atualização (pode virar `null` se omitido).
- Campo `cidade` existe na entidade mas é **inacessível via API** (ausente
  do DTO e nunca manipulado pelo service) — todo funcionário criado/
  atualizado terá `cidade = null`.
- **Sem** validação de vínculo ao excluir (agendamentos referenciam
  funcionário).
- Retorna a entidade JPA diretamente.

### 3.11 Fornecedor
- CPF/CNPJ (opcional) validado via `CpfCnpjValidator`: se 11 dígitos após
  remover não-numéricos, valida como CPF (`"CPF inválido."`); caso
  contrário, valida como CNPJ (`"CNPJ inválido."`) — **atenção**: um valor
  com quantidade de dígitos diferente de 11 e de 14 (ex.: 9 dígitos) cairá
  no ramo CNPJ e retornará `"CNPJ inválido."` mesmo não sendo uma tentativa
  de CNPJ.
- **Sem** checagem de duplicidade de `cpfCnpj` (coluna não é `unique`).
- Vínculos opcionais com Cidade e CondicaoPagamento — **não tolerantes**:
  id inexistente lança `"Cidade não encontrada"` / `"Condição de pagamento
  não encontrada"` (tanto em criar quanto atualizar).
- `ativo`: único módulo de pessoa/cadastro que checa nulidade corretamente
  antes de sobrescrever na atualização.
- Bloqueia exclusão se houver contas a pagar vinculadas: `"Fornecedor
  possui contas a pagar vinculadas e não pode ser excluído"`.

### 3.12 Serviço
- Nome único (case-insensitive), checado apenas na criação: `"Serviço já
  cadastrado"`.
- `ativo` sobrescrito sem checagem de nulo na atualização.
- **Sem** validação de vínculo com agendamentos ao excluir — se o serviço
  estiver referenciado em `agendamento_servicos`, a exclusão falhará por
  violação de FK no banco (não há `ON DELETE CASCADE` do lado
  `servico_id`).
- Retorna a entidade JPA diretamente (sem Response DTO).

### 3.13 Agendamento
- Exige Cliente existente (`"Cliente não encontrado"`) e Funcionário
  existente (`"Funcionário não encontrado"`) na criação/atualização.
- Serviços resolvidos via `findAllById` — **não valida** se todos os IDs
  solicitados foram encontrados (IDs inexistentes são silenciosamente
  omitidos da lista).
- `valorTotal` sempre **calculado automaticamente** pelo backend, somando o
  preço de cada serviço selecionado — nunca confia em valor enviado pelo
  cliente.
- Status inicial sempre `"AGENDADO"`. Máquina de estados:
  - `confirmar()`: só a partir de `AGENDADO`, senão `"Só é possível
    confirmar agendamentos com status AGENDADO"`.
  - `concluir()`: só a partir de `CONFIRMADO`, senão `"Só é possível
    concluir agendamentos com status CONFIRMADO"`.
  - `cancelar()`: bloqueado se já `CONCLUIDO` ou `CANCELADO`: `"Não é
    possível cancelar agendamento com status " + status` (mensagem
    dinâmica).
  - `deletar()`: só permitido com status `CANCELADO`, senão `"Só é
    possível excluir agendamentos com status CANCELADO"` (exclusão física).
- `atualizar()` **não tem trava de status** — pode-se editar um
  agendamento em qualquer estado, recalculando serviços e valor total.
- Listagens sempre indicam (`nfseGerada: boolean`) se já existe NFS-e
  emitida para o agendamento (consulta adicional por item da lista — risco
  de N+1 queries).

### 3.14 Forma de Pagamento
- Descrição única (case-sensitive): `"Forma de pagamento já cadastrada"`
  (checada apenas na criação).
- Defaults: `percentual = ZERO`, `numeroDias = 0`, `ativo = true` se
  omitidos na criação; na atualização, só sobrescreve se não nulo.
- Bloqueia exclusão se houver parcelas vinculadas: `"Não é possível
  excluir: existem parcelas vinculadas a esta forma de pagamento"`.

### 3.15 Condição de Pagamento
- Descrição única: `"Condição de pagamento já cadastrada"` (checada
  apenas na criação).
- Defaults: `multa`, `juro`, `desconto` → `ZERO` se omitidos; `ativo` →
  `true`.
- **Criação embutida de parcelas**: o payload de criação/atualização aceita
  uma lista de parcelas (`ParcelaRequestDTO`), resolvendo a Forma de
  Pagamento de cada uma (`"Forma de pagamento não encontrada"` se
  informada e inexistente).
- **Atualização substitui totalmente as parcelas**: limpa a coleção
  (`orphanRemoval=true` provoca exclusão física das antigas) e recria do
  zero a partir do payload — não faz merge incremental por ID.
- Exclusão em cascata: como o relacionamento tem `cascade=ALL`, excluir a
  condição de pagamento exclui automaticamente todas as suas parcelas.
- Sem validação de vínculo com Fornecedor ao excluir.

### 3.16 Parcela
- Vínculos opcionais com Forma de Pagamento e Condição de Pagamento:
  tolerantes a `null` (não exige nenhum dos dois), mas **não tolerantes** a
  ID inválido — se um ID for informado e não existir, lança
  `"Forma de pagamento não encontrada"` / `"Condição de pagamento não
  encontrada"`.
- Na atualização, se o DTO enviar o id do vínculo como `null`, o vínculo
  existente é **removido** (não é preservado).
- Sem validação de vínculo com Contas a Pagar/Receber ao excluir.
- Existe tanto como CRUD independente (`/api/parcelas`) quanto como
  sub-recurso embutido em Condição de Pagamento — dois caminhos possíveis
  de criação.

### 3.17 Contas a Pagar
- Exige Fornecedor existente: `"Fornecedor não encontrado"`. Parcela
  opcional: `"Parcela não encontrada"` se informada e inexistente.
- Situação inicial sempre `"ABERTA"`.
- `pagar()`: bloqueado se já `"CANCELADA"` (`"Não é possível pagar uma
  conta cancelada"`); senão seta `"PAGA"` e `dataPagamento = hoje`. Pagar
  uma conta já paga não é bloqueado (idempotente).
- `cancelar()`: bloqueado se já `"PAGA"` (`"Não é possível cancelar uma
  conta já paga"`).
- Exclusão só permitida com situação `"CANCELADA"`: `"Só é possível
  excluir contas com situação CANCELADA"` (hard delete).
- `atualizar()` **não tem trava de situação** — permite editar mesmo se já
  paga/cancelada.
- Campo `ativo` existe mas é morto (nunca alterado, não usado em regra).

### 3.18 Contas a Receber
- Espelha Contas a Pagar trocando Fornecedor por Cliente.
- `receber()`: bloqueado se já `"CANCELADA"` (`"Não é possível receber uma
  conta cancelada"`); seta `"RECEBIDA"` e `dataRecebimento = hoje`.
- `cancelar()`: bloqueado se já `"RECEBIDA"` (`"Não é possível cancelar uma
  conta já recebida"`).
- Exclusão só permitida com situação `"CANCELADA"`.

### 3.19 Compra
- Exige Fornecedor existente: `"Fornecedor não encontrado"`. Cada item
  exige Produto existente: `"Produto não encontrado: " + id`.
- Subtotal de cada item = `quantidade × precoUnitario`; `valorTotal` da
  compra = soma dos subtotais — **sempre recalculado no backend**.
- Status inicial `"RASCUNHO"`. Máquina de estados:
  - `atualizar()`: só em `"RASCUNHO"`, senão `"Compra não pode ser
    editada no status atual"`; substitui todos os itens (delete-all +
    insert-all via `orphanRemoval`) e recalcula o total.
  - `validar()`: só a partir de `"RASCUNHO"` (`"Compra não pode ser
    validada no status atual"`); exige ao menos um item (`"Compra deve ter
    ao menos um item"`); muda para `"VALIDADA"`.
  - `cancelar()`: bloqueado se já `"NFE_GERADA"` (`"Compra com nota fiscal
    gerada não pode ser cancelada"`); permitido a partir de qualquer outro
    estado, inclusive repetidamente sobre `CANCELADA` (idempotente, sem
    trava extra).
  - `gerarNfe()`: só a partir de `"VALIDADA"` (`"Nota fiscal só pode ser
    gerada para compras validadas"`); cria a `NotaFiscalEntrada` (via
    `NotaFiscalEntradaService.criarParaCompra`) e muda status para
    `"NFE_GERADA"`.
- **Sem** operação de exclusão física (não há endpoint `DELETE`).
- **Não** debita/credita estoque do Produto.

### 3.20 Venda
- Espelha Compra, trocando Fornecedor por Cliente. Mesmas mensagens
  equivalentes: `"Cliente não encontrado"`, `"Produto não encontrado: " +
  id`, `"Venda não pode ser editada no status atual"`, `"Venda não pode
  ser validada no status atual"`, `"Venda deve ter ao menos um item"`,
  `"Venda com nota fiscal gerada não pode ser cancelada"`, `"Nota fiscal só
  pode ser gerada para vendas validadas"`.
- Mesma máquina de estados `RASCUNHO → VALIDADA → NFE_GERADA`, com
  `CANCELADA` acessível de qualquer estado exceto `NFE_GERADA`.
- Não debita/credita estoque do Produto.

### 3.21 Nota Fiscal de Entrada
- Criada **exclusivamente** a partir de uma Compra validada, via
  `Compra.gerarNfe()` → `NotaFiscalEntradaService.criarParaCompra` — nunca
  via endpoint próprio de criação.
- Copia fornecedor e valor total da compra; série fixa `"1"`.
- Numeração automática: `"NFE-" + id` formatado com 6 dígitos (ex.:
  `NFE-000042`), calculada após o primeiro `save()` (exige um segundo save
  para persistir o número).
- `chaveAcesso` nunca é preenchido (sempre `null` — não há integração real
  com SEFAZ).
- Endpoint próprio (`PUT .../transporte`) permite apenas atualizar dados de
  transporte (transportadora e placa), **sem validação de estado** (pode
  ser chamado a qualquer momento, mesmo repetidamente).

### 3.22 Nota Fiscal de Saída
- Espelha Nota Fiscal de Entrada: criada apenas a partir de Venda validada,
  via `Venda.gerarNfe()` → `NotaFiscalSaidaService.criarParaVenda`.
- Copia cliente e valor total da venda; série fixa `"1"`; numeração
  `"NFS-" + id` (6 dígitos).
- Mesmas observações sobre `chaveAcesso` e atualização de transporte sem
  validação de estado.

### 3.23 Nota Fiscal de Serviço (NFS-e)
- **Único módulo fiscal com endpoint de criação próprio**:
  `POST /gerar/{agendamentoId}`.
- Exige Agendamento existente (`"Agendamento não encontrado"`) com status
  `"CONCLUIDO"` (`"NFS-e só pode ser gerada para agendamentos
  concluídos"`).
- Impede duplicidade explicitamente: se já existe NFS-e para o
  agendamento (`existsByAgendamentoId`), lança `"NFS-e já foi gerada para
  este agendamento"` — a única nota fiscal com essa checagem de
  duplicidade explícita no service (as demais dependem apenas da máquina
  de estados de Compra/Venda para não duplicar).
- Copia cliente e valor total do agendamento; série fixa `"1"`; numeração
  `"NFSE-" + id` (6 dígitos).
- Sem campos de transporte (não se aplica).

### 3.24 Validação de CPF/CNPJ (`com.salao.util.CpfCnpjValidator`)
- Classe utilitária final, métodos estáticos `validarCPF(String)` e
  `validarCNPJ(String)`, aplicando o algoritmo oficial de dígitos
  verificadores (módulo 11) após remover caracteres não numéricos e
  descartar sequências com todos os dígitos iguais (ex.: `111.111.111-11`).
- Usada por `ClienteService` e `FuncionarioService` (somente CPF) e por
  `FornecedorService` (CPF ou CNPJ, conforme quantidade de dígitos).

### 3.25 Tratamento global de erros
- `com.salao.config.GlobalExceptionHandler` (`@RestControllerAdvice`)
  captura **toda** `RuntimeException` lançada por qualquer regra de negócio
  acima e converte para **HTTP 400 Bad Request**, respondendo em JSON:
  `{"mensagem": "<mensagem da exceção>"}`.
- Exceção: exclusões que caem em `deleteById` sem checagem prévia de
  existência (ex.: `Categoria.deletar`, `Cliente.deletar`,
  `Funcionario.deletar`, `Produto.deletar`, `Servico.deletar`) podem lançar
  `EmptyResultDataAccessException`, que **não** é `RuntimeException` de
  negócio tratada explicitamente — comportamento HTTP resultante depende do
  tratamento padrão do Spring para exceções não capturadas pelo handler
  (tipicamente 500, já que `EmptyResultDataAccessException` não estende
  `RuntimeException` de forma capturada explicitamente pelo handler, embora
  tecnicamente seja uma `RuntimeException` — na prática o Spring Boot
  aplica seu próprio tratamento de `DataAccessException` antes, dependendo
  da ordem de resolução dos `@ExceptionHandler`).

### 3.26 Padrões transversais observados
- Totais (Compra, Venda, Agendamento) sempre recalculados no backend a
  partir dos itens/serviços, nunca confiando em valor enviado pelo
  cliente.
- Máquinas de estado (Agendamento, Compra/Venda, Contas a Pagar/Receber)
  representadas por `String` comparada com `.equals()`, não por `enum`
  Java — sem validação de valores arbitrários sendo persistidos.
- Numeração de documentos fiscais (`NFE-`, `NFS-`, `NFSE-`) gerada
  automaticamente com base no id (sequencial, 6 dígitos), diferente de
  Compra/Venda, cujo número é informado externamente e precisa ser único.
- Sem integração automática entre estoque e financeiro: `Produto.quantidade`
  nunca é alterado por Compra/Venda; validar uma Compra/Venda não gera
  automaticamente registros em Contas a Pagar/Receber.

---

## 4. ENDPOINTS / API

> Todas as rotas usam prefixo `/api`. Corpo de requisição via `@RequestBody
> @Valid` aciona Bean Validation dos DTOs (respondendo 400 com detalhes de
> binding, conforme `server.error.include-binding-errors=always`). Todas as
> exceções de regra de negócio (`RuntimeException`) resultam em
> `400 Bad Request` com `{"mensagem": "..."}`.

### 4.1 País — `PaisController` (`/api/paises`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/paises` | — | `List<PaisResponseDTO>` | 200 |
| GET | `/api/paises/{id}` | path `id` | `PaisResponseDTO` | 200 |
| POST | `/api/paises` | `PaisRequestDTO` | `PaisResponseDTO` | 201 |
| PUT | `/api/paises/{id}` | path `id`, `PaisRequestDTO` | `PaisResponseDTO` | 200 |
| DELETE | `/api/paises/{id}` | path `id` | — | 204 |

### 4.2 Estado — `EstadoController` (`/api/estados`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/estados` | — | `List<EstadoResponseDTO>` | 200 |
| GET | `/api/estados/{id}` | path `id` | `EstadoResponseDTO` | 200 |
| GET | `/api/estados/por-pais/{paisId}` | path `paisId` | `List<EstadoResponseDTO>` | 200 |
| POST | `/api/estados` | `EstadoRequestDTO` | `EstadoResponseDTO` | 201 |
| PUT | `/api/estados/{id}` | path `id`, `EstadoRequestDTO` | `EstadoResponseDTO` | 200 |
| DELETE | `/api/estados/{id}` | path `id` | — | 204 |

### 4.3 Cidade — `CidadeController` (`/api/cidades`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/cidades` | — | `List<CidadeResponseDTO>` | 200 |
| GET | `/api/cidades/{id}` | path `id` | `CidadeResponseDTO` | 200 |
| GET | `/api/cidades/por-estado/{estadoId}` | path `estadoId` | `List<CidadeResponseDTO>` | 200 |
| POST | `/api/cidades` | `CidadeRequestDTO` | `CidadeResponseDTO` | 201 |
| PUT | `/api/cidades/{id}` | path `id`, `CidadeRequestDTO` | `CidadeResponseDTO` | 200 |
| DELETE | `/api/cidades/{id}` | path `id` | — | 204 |

### 4.4 Categoria — `CategoriaController` (`/api/categorias`)
| Método | Rota | Entrada | Saída (entidade, não DTO) | Status |
|---|---|---|---|---|
| GET | `/api/categorias` | — | `List<Categoria>` | 200 |
| GET | `/api/categorias/{id}` | path `id` | `Categoria` | 200 |
| POST | `/api/categorias` | `CategoriaDTO` | `Categoria` | 201 |
| PUT | `/api/categorias/{id}` | path `id`, `CategoriaDTO` | `Categoria` | 200 |
| DELETE | `/api/categorias/{id}` | path `id` | — | 204 |

### 4.5 Marca — `MarcaController` (`/api/marcas`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/marcas` | — | `List<MarcaResponseDTO>` | 200 |
| GET | `/api/marcas/{id}` | path `id` | `MarcaResponseDTO` | 200 |
| POST | `/api/marcas` | `MarcaRequestDTO` | `MarcaResponseDTO` | 201 |
| PUT | `/api/marcas/{id}` | path `id`, `MarcaRequestDTO` | `MarcaResponseDTO` | 200 |
| DELETE | `/api/marcas/{id}` | path `id` | — | 204 |

### 4.6 Unidade de Medida — `UnidadeMedidaController` (`/api/unidades-medida`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/unidades-medida` | — | `List<UnidadeMedidaResponseDTO>` | 200 |
| GET | `/api/unidades-medida/{id}` | path `id` | `UnidadeMedidaResponseDTO` | 200 |
| POST | `/api/unidades-medida` | `UnidadeMedidaRequestDTO` | `UnidadeMedidaResponseDTO` | 201 |
| PUT | `/api/unidades-medida/{id}` | path `id`, DTO | `UnidadeMedidaResponseDTO` | 200 |
| DELETE | `/api/unidades-medida/{id}` | path `id` | — | 204 |

### 4.7 NCM/SH — `NcmShController` (`/api/ncm-sh`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/ncm-sh` | — | `List<NcmShResponseDTO>` | 200 |
| GET | `/api/ncm-sh/{id}` | path `id` | `NcmShResponseDTO` | 200 |
| POST | `/api/ncm-sh` | `NcmShRequestDTO` | `NcmShResponseDTO` | 201 |
| PUT | `/api/ncm-sh/{id}` | path `id`, DTO | `NcmShResponseDTO` | 200 |
| DELETE | `/api/ncm-sh/{id}` | path `id` | — | 204 |

### 4.8 Produto — `ProdutoController` (`/api/produtos`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/produtos` | — | `List<ProdutoResponseDTO>` | 200 |
| GET | `/api/produtos/{id}` | path `id` | `ProdutoResponseDTO` | 200 |
| POST | `/api/produtos` | `ProdutoDTO` | `ProdutoResponseDTO` | 201 |
| PUT | `/api/produtos/{id}` | path `id`, `ProdutoDTO` | `ProdutoResponseDTO` | 200 |
| DELETE | `/api/produtos/{id}` | path `id` | — | 204 |

### 4.9 Cliente — `ClienteController` (`/api/clientes`)
| Método | Rota | Entrada | Saída (entidade) | Status |
|---|---|---|---|---|
| GET | `/api/clientes` | — | `List<Cliente>` | 200 |
| GET | `/api/clientes/{id}` | path `id` | `Cliente` | 200 |
| POST | `/api/clientes` | `ClienteDTO` | `Cliente` | 201 |
| PUT | `/api/clientes/{id}` | path `id`, `ClienteDTO` | `Cliente` | 200 |
| DELETE | `/api/clientes/{id}` | path `id` | — | 204 |

### 4.10 Funcionário — `FuncionarioController` (`/api/funcionarios`)
| Método | Rota | Entrada | Saída (entidade) | Status |
|---|---|---|---|---|
| GET | `/api/funcionarios` | — | `List<Funcionario>` | 200 |
| GET | `/api/funcionarios/{id}` | path `id` | `Funcionario` | 200 |
| POST | `/api/funcionarios` | `FuncionarioDTO` | `Funcionario` | 201 |
| PUT | `/api/funcionarios/{id}` | path `id`, DTO | `Funcionario` | 200 |
| DELETE | `/api/funcionarios/{id}` | path `id` | — | 204 |

### 4.11 Fornecedor — `FornecedorController` (`/api/fornecedores`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/fornecedores` | — | `List<FornecedorResponseDTO>` | 200 |
| GET | `/api/fornecedores/{id}` | path `id` | `FornecedorResponseDTO` | 200 |
| POST | `/api/fornecedores` | `FornecedorRequestDTO` | `FornecedorResponseDTO` | 201 |
| PUT | `/api/fornecedores/{id}` | path `id`, DTO | `FornecedorResponseDTO` | 200 |
| DELETE | `/api/fornecedores/{id}` | path `id` | — | 204 |

### 4.12 Serviço — `ServicoController` (`/api/servicos`)
| Método | Rota | Entrada | Saída (entidade) | Status |
|---|---|---|---|---|
| GET | `/api/servicos` | — | `List<Servico>` | 200 |
| GET | `/api/servicos/{id}` | path `id` | `Servico` | 200 |
| POST | `/api/servicos` | `ServicoDTO` | `Servico` | 201 |
| PUT | `/api/servicos/{id}` | path `id`, DTO | `Servico` | 200 |
| DELETE | `/api/servicos/{id}` | path `id` | — | 204 |

### 4.13 Agendamento — `AgendamentoController` (`/api/agendamentos`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/agendamentos` | — | `List<AgendamentoResponseDTO>` | 200 |
| GET | `/api/agendamentos/{id}` | path `id` | `AgendamentoResponseDTO` | 200 |
| GET | `/api/agendamentos/por-data` | query `data=yyyy-MM-dd` | `List<AgendamentoResponseDTO>` | 200 |
| POST | `/api/agendamentos` | `AgendamentoRequestDTO` | `AgendamentoResponseDTO` | 201 |
| PUT | `/api/agendamentos/{id}` | path `id`, DTO | `AgendamentoResponseDTO` | 200 |
| DELETE | `/api/agendamentos/{id}` | path `id` (só se `CANCELADO`) | — | 204 |
| POST | `/api/agendamentos/{id}/confirmar` | path `id` | `AgendamentoResponseDTO` | 200 |
| POST | `/api/agendamentos/{id}/concluir` | path `id` | `AgendamentoResponseDTO` | 200 |
| POST | `/api/agendamentos/{id}/cancelar` | path `id` | `AgendamentoResponseDTO` | 200 |

### 4.14 Forma de Pagamento — `FormaPagamentoController` (`/api/formas-pagamento`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/formas-pagamento` | — | `List<FormaPagamentoResponseDTO>` | 200 |
| GET | `/api/formas-pagamento/{id}` | path `id` | `FormaPagamentoResponseDTO` | 200 |
| POST | `/api/formas-pagamento` | `FormaPagamentoRequestDTO` | `FormaPagamentoResponseDTO` | 201 |
| PUT | `/api/formas-pagamento/{id}` | path `id`, DTO | `FormaPagamentoResponseDTO` | 200 |
| DELETE | `/api/formas-pagamento/{id}` | path `id` | — | 204 |

### 4.15 Condição de Pagamento — `CondicaoPagamentoController` (`/api/condicoes-pagamento`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/condicoes-pagamento` | — | `List<CondicaoPagamentoResponseDTO>` | 200 |
| GET | `/api/condicoes-pagamento/{id}` | path `id` | `CondicaoPagamentoResponseDTO` | 200 |
| POST | `/api/condicoes-pagamento` | `CondicaoPagamentoRequestDTO` (com lista de parcelas embutida) | `CondicaoPagamentoResponseDTO` | 201 |
| PUT | `/api/condicoes-pagamento/{id}` | path `id`, DTO (substitui todas as parcelas) | `CondicaoPagamentoResponseDTO` | 200 |
| DELETE | `/api/condicoes-pagamento/{id}` | path `id` (exclui parcelas em cascata) | — | 204 |

### 4.16 Parcela — `ParcelaController` (`/api/parcelas`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/parcelas` | — | `List<ParcelaResponseDTO>` | 200 |
| GET | `/api/parcelas/{id}` | path `id` | `ParcelaResponseDTO` | 200 |
| POST | `/api/parcelas` | `ParcelaRequestDTO` | `ParcelaResponseDTO` | 201 |
| PUT | `/api/parcelas/{id}` | path `id`, DTO | `ParcelaResponseDTO` | 200 |
| DELETE | `/api/parcelas/{id}` | path `id` | — | 204 |

### 4.17 Contas a Pagar — `ContasPagarController` (`/api/contas-pagar`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/contas-pagar` | — | `List<ContasPagarResponseDTO>` | 200 |
| GET | `/api/contas-pagar/{id}` | path `id` | `ContasPagarResponseDTO` | 200 |
| POST | `/api/contas-pagar` | `ContasPagarRequestDTO` | `ContasPagarResponseDTO` | 201 |
| PUT | `/api/contas-pagar/{id}` | path `id`, DTO | `ContasPagarResponseDTO` | 200 |
| DELETE | `/api/contas-pagar/{id}` | path `id` (só se `CANCELADA`) | — | 204 |
| POST | `/api/contas-pagar/{id}/pagar` | path `id` | `ContasPagarResponseDTO` | 200 |
| POST | `/api/contas-pagar/{id}/cancelar` | path `id` | `ContasPagarResponseDTO` | 200 |

### 4.18 Contas a Receber — `ContasReceberController` (`/api/contas-receber`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/contas-receber` | — | `List<ContasReceberResponseDTO>` | 200 |
| GET | `/api/contas-receber/{id}` | path `id` | `ContasReceberResponseDTO` | 200 |
| POST | `/api/contas-receber` | `ContasReceberRequestDTO` | `ContasReceberResponseDTO` | 201 |
| PUT | `/api/contas-receber/{id}` | path `id`, DTO | `ContasReceberResponseDTO` | 200 |
| DELETE | `/api/contas-receber/{id}` | path `id` (só se `CANCELADA`) | — | 204 |
| POST | `/api/contas-receber/{id}/receber` | path `id` | `ContasReceberResponseDTO` | 200 |
| POST | `/api/contas-receber/{id}/cancelar` | path `id` | `ContasReceberResponseDTO` | 200 |

### 4.19 Compra — `CompraController` (`/api/compras`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/compras` | — | `List<CompraResponseDTO>` | 200 |
| GET | `/api/compras/{id}` | path `id` | `CompraResponseDTO` | 200 |
| POST | `/api/compras` | `CompraRequestDTO` (com itens embutidos) | `CompraResponseDTO` | 201 |
| PUT | `/api/compras/{id}` | path `id`, DTO (só em `RASCUNHO`, substitui itens) | `CompraResponseDTO` | 200 |
| POST | `/api/compras/{id}/validar` | path `id` | `CompraResponseDTO` | 200 |
| POST | `/api/compras/{id}/cancelar` | path `id` | `CompraResponseDTO` | 200 |
| POST | `/api/compras/{id}/gerar-nfe` | path `id` | `NotaFiscalEntradaResponseDTO` | 200 |

Sem `DELETE`.

### 4.20 Venda — `VendaController` (`/api/vendas`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/vendas` | — | `List<VendaResponseDTO>` | 200 |
| GET | `/api/vendas/{id}` | path `id` | `VendaResponseDTO` | 200 |
| POST | `/api/vendas` | `VendaRequestDTO` (com itens embutidos) | `VendaResponseDTO` | 201 |
| PUT | `/api/vendas/{id}` | path `id`, DTO (só em `RASCUNHO`, substitui itens) | `VendaResponseDTO` | 200 |
| POST | `/api/vendas/{id}/validar` | path `id` | `VendaResponseDTO` | 200 |
| POST | `/api/vendas/{id}/cancelar` | path `id` | `VendaResponseDTO` | 200 |
| POST | `/api/vendas/{id}/gerar-nfe` | path `id` | `NotaFiscalSaidaResponseDTO` | 200 |

Sem `DELETE`.

### 4.21 Nota Fiscal de Entrada — `NotaFiscalEntradaController` (`/api/notas-fiscais-entrada`)
| Método | Rota | Entrada | Saída |
|---|---|---|---|
| GET | `/api/notas-fiscais-entrada` | — | `List<NotaFiscalEntradaResponseDTO>` |
| GET | `/api/notas-fiscais-entrada/{id}` | path `id` | `NotaFiscalEntradaResponseDTO` |
| PUT | `/api/notas-fiscais-entrada/{id}/transporte` | path `id`, `TransporteRequestDTO` | `NotaFiscalEntradaResponseDTO` |

Sem `POST` direto (criação apenas via `Compra.gerar-nfe`).

### 4.22 Nota Fiscal de Saída — `NotaFiscalSaidaController` (`/api/notas-fiscais-saida`)
| Método | Rota | Entrada | Saída |
|---|---|---|---|
| GET | `/api/notas-fiscais-saida` | — | `List<NotaFiscalSaidaResponseDTO>` |
| GET | `/api/notas-fiscais-saida/{id}` | path `id` | `NotaFiscalSaidaResponseDTO` |
| PUT | `/api/notas-fiscais-saida/{id}/transporte` | path `id`, `TransporteRequestDTO` | `NotaFiscalSaidaResponseDTO` |

Sem `POST` direto (criação apenas via `Venda.gerar-nfe`).

### 4.23 Nota Fiscal de Serviço/NFS-e — `NotaFiscalServicoController` (`/api/notas-fiscais-servico`)
| Método | Rota | Entrada | Saída | Status |
|---|---|---|---|---|
| GET | `/api/notas-fiscais-servico` | — | `List<NotaFiscalServicoResponseDTO>` | 200 |
| GET | `/api/notas-fiscais-servico/{id}` | path `id` | `NotaFiscalServicoResponseDTO` | 200 |
| POST | `/api/notas-fiscais-servico/gerar/{agendamentoId}` | path `agendamentoId` | `NotaFiscalServicoResponseDTO` | 201 |

### 4.24 Tratamento de erros comum a todos os endpoints
Todo `RuntimeException` lançado por qualquer service (mensagens listadas na
seção 3) é convertido pelo `GlobalExceptionHandler` em:
```json
HTTP 400 Bad Request
{ "mensagem": "<mensagem exata da exceção>" }
```
Erros de validação Bean Validation (`@Valid` falho) seguem o tratamento
padrão do Spring (400, com detalhes de binding habilitados via
`server.error.include-binding-errors=always`).

---

## 5. FLUXOS DE PROCESSO

### 5.1 Cadastro de Cliente (criar)
1. `POST /api/clientes` com `ClienteDTO`.
2. Bean Validation: `nome` obrigatório (`@NotBlank`); demais campos livres.
3. `ClienteService.salvar`: se `cpf` informado, valida dígito verificador
   (`CpfCnpjValidator.validarCPF`) → se inválido, aborta com
   `"CPF inválido."` (400).
4. Verifica duplicidade de CPF (`existsByCpf`) → se já existir, aborta com
   `"CPF já cadastrado"` (400).
5. Resolve `Cidade` por `cidadeId`, se informado — se não encontrada, segue
   sem erro (`cidade = null`).
6. Persiste via `ClienteRepository.save`; `ativo` assume default `true`.
7. Retorna a entidade `Cliente` persistida com 201 Created.

### 5.2 Cadastro e ciclo de vida de Agendamento
1. `POST /api/agendamentos` com `AgendamentoRequestDTO`
   (`dataHora`, `clienteId`, `funcionarioId`, `servicoIds`).
2. Bean Validation: todos os 4 campos obrigatórios (`servicoIds`
   não-vazio).
3. `AgendamentoService.criar`: busca `Cliente` (erro `"Cliente não
   encontrado"` se ausente), busca `Funcionario` (erro `"Funcionário não
   encontrado"`), busca todos os `Servico` por id (ignorando ids
   inexistentes).
4. Calcula `valorTotal` somando `preco` de cada serviço encontrado.
5. Constrói e salva `Agendamento` com `status = "AGENDADO"`.
6. Retorna `AgendamentoResponseDTO` com `nfseGerada = false` e 201 Created.
7. **Confirmar**: `POST /{id}/confirmar` — exige status `AGENDADO`, senão
   erro 400; muda para `CONFIRMADO`.
8. **Concluir**: `POST /{id}/concluir` — exige status `CONFIRMADO`, senão
   erro 400; muda para `CONCLUIDO`.
9. **Cancelar**: `POST /{id}/cancelar` — bloqueado se `CONCLUIDO` ou já
   `CANCELADO`; muda para `CANCELADO`.
10. **Excluir**: `DELETE /{id}` — só permitido se status `CANCELADO`; caso
    contrário, erro 400; se permitido, remoção física do banco.
11. Uma vez `CONCLUIDO`, pode-se gerar NFS-e via
    `POST /api/notas-fiscais-servico/gerar/{agendamentoId}` (ver 5.5).

### 5.3 Ciclo de vida de Compra (com geração de NF-e de entrada)
1. `POST /api/compras` com `CompraRequestDTO` (`fornecedorId`, `dataCompra`,
   lista de itens `produtoId`/`quantidade`/`precoUnitario`).
2. `CompraService.criar`: valida fornecedor (erro se ausente); para cada
   item, valida produto (erro `"Produto não encontrado: <id>"` se ausente)
   e calcula `subtotal = quantidade × precoUnitario`.
3. Calcula `valorTotal` = soma dos subtotais; persiste `Compra` com
   `status = "RASCUNHO"` e itens em cascata.
4. **Editar** (`PUT /{id}`): permitido só em `RASCUNHO`; substitui
   integralmente os itens (remove todos os antigos via `orphanRemoval`,
   recria a partir do payload) e recalcula o total. Fora de `RASCUNHO`,
   erro 400 `"Compra não pode ser editada no status atual"`.
5. **Validar** (`POST /{id}/validar`): exige status `RASCUNHO` e ao menos
   um item; muda para `VALIDADA`. Sem itens → erro `"Compra deve ter ao
   menos um item"`.
6. **Gerar NF-e** (`POST /{id}/gerar-nfe`): exige status `VALIDADA`; cria
   `NotaFiscalEntrada` (copiando fornecedor/valorTotal, série `"1"`,
   numeração automática `NFE-000NNN` após o primeiro save); muda status da
   compra para `NFE_GERADA`. Fora de `VALIDADA` → erro 400.
7. **Cancelar** (`POST /{id}/cancelar`): bloqueado apenas se
   `NFE_GERADA` (`"Compra com nota fiscal gerada não pode ser
   cancelada"`); permitido a partir de `RASCUNHO` ou `VALIDADA`.
8. Não há exclusão física de Compra.
9. Estoque do produto **não é alterado** em nenhum passo.

### 5.4 Ciclo de vida de Venda (espelha Compra)
Idêntico ao fluxo 5.3, trocando Fornecedor por Cliente e gerando
`NotaFiscalSaida` (numeração `NFS-000NNN`) em vez de `NotaFiscalEntrada`.

### 5.5 Geração de NFS-e para Agendamento
1. Pré-condição: `Agendamento` deve estar com status `CONCLUIDO`
   (alcançado via fluxo 5.2).
2. `POST /api/notas-fiscais-servico/gerar/{agendamentoId}`.
3. `NotaFiscalServicoService.gerarParaAgendamento`: busca o agendamento
   (erro `"Agendamento não encontrado"` se ausente); verifica status
   (`"NFS-e só pode ser gerada para agendamentos concluídos"` se não
   `CONCLUIDO`); verifica duplicidade (`"NFS-e já foi gerada para este
   agendamento"` se já existir uma NFS-e para o mesmo agendamento).
4. Cria `NotaFiscalServico` copiando cliente/valorTotal do agendamento,
   série `"1"`, numeração `NFSE-000NNN`.
5. Retorna `NotaFiscalServicoResponseDTO` com 201 Created.

### 5.6 Ciclo de Contas a Pagar
1. `POST /api/contas-pagar`: exige fornecedor existente; parcela opcional;
   `situacao` inicial `"ABERTA"`.
2. **Pagar** (`POST /{id}/pagar`): bloqueado se `CANCELADA`; muda para
   `PAGA`, registra `dataPagamento = hoje`.
3. **Cancelar** (`POST /{id}/cancelar`): bloqueado se `PAGA`; muda para
   `CANCELADA`.
4. **Excluir** (`DELETE /{id}`): só permitido se `CANCELADA`, senão erro
   400; caso permitido, remoção física.
5. `PUT /{id}` (editar) não tem trava de situação — pode ser feito mesmo
   após paga/cancelada.

### 5.7 Ciclo de Contas a Receber
Idêntico ao 5.6, trocando Fornecedor por Cliente e `pagar`/`PAGA` por
`receber`/`RECEBIDA`.

### 5.8 Cadastro de Condição de Pagamento com Parcelas
1. `POST /api/condicoes-pagamento` com `condicao`, `multa`, `juro`,
   `desconto`, `ativo` e lista `parcelas` (cada uma com `numeroParcela`,
   `diasVencimento`, `formaPagamentoId` opcional).
2. Verifica duplicidade de `condicao` (erro `"Condição de pagamento já
   cadastrada"` se já existir).
3. Para cada parcela do payload: resolve `FormaPagamento` (erro se id
   inválido) e associa à condição sendo criada.
4. Persiste a condição com `cascade = ALL`, gravando as parcelas junto.
5. **Editar** (`PUT /{id}`): limpa toda a coleção de parcelas existente
   (exclusão física via `orphanRemoval`) e recria do zero a partir do novo
   payload — qualquer parcela não reenviada é perdida, e todas as
   reenviadas viram novos registros (novos IDs).
6. **Excluir**: remove a condição e, em cascata, todas as suas parcelas.

---

## 6. DIAGRAMA DE CLASSES (texto)

```
Pais
 ├─ id, nome, sigla, nacionalidade, moeda, ativo, dataCriacao, dataAtualizacao
 └─ associação 1:N → Estado (inverso, via Estado.pais)

Estado
 ├─ id, nome, uf, ativo, dataCriacao, dataAtualizacao
 ├─ associação N:1 → Pais (pais)
 └─ associação 1:N → Cidade (inverso, via Cidade.estado)

Cidade
 ├─ id, nome, codigoIbge, ativo, dataCriacao, dataAtualizacao
 ├─ associação N:1 → Estado (estado)
 └─ referenciada por: Cliente, Funcionario, Fornecedor (N:1 do lado deles)

Categoria
 └─ id, nome, ativo, dataCriacao, dataAtualizacao   (sem relacionamentos)

Marca
 ├─ id, marca, ativo, criadoEm, atualizadoEm
 └─ associação 1:N → Produto (inverso)

UnidadeMedida
 ├─ id, unidadeMedida, sigla, ativo, criadoEm, atualizadoEm
 └─ associação 1:N → Produto (inverso)

NcmSh
 ├─ id, codigo, descricao, ativo, criadoEm, atualizadoEm
 └─ associação 1:N → Produto (inverso)

Produto
 ├─ id, nome, descricao, precoVenda, precoCusto, desconto, quantidade,
 │  ativo, criadoEm, atualizadoEm
 ├─ associação N:1 → NcmSh (ncmSh, opcional)
 ├─ associação N:1 → Marca (marca, opcional)
 ├─ associação N:1 → UnidadeMedida (unidadeMedida, opcional)
 └─ referenciado por: CompraItem, VendaItem (N:1 do lado deles)

Cliente
 ├─ id, nome, apelido, email, telefone, endereco, numero, complemento,
 │  bairro, cep, cpf, rg, dataNascimento, sexo, estadoCivil, observacao,
 │  ativo, criadoEm, atualizadoEm
 ├─ associação N:1 → Cidade (opcional, tolerante)
 └─ referenciado por: Agendamento, ContasReceber, NotaFiscalSaida,
    NotaFiscalServico, Venda (N:1 do lado deles)

Funcionario
 ├─ id, nome, apelido, email, telefone, cpf, dataNascimento, dataAdmissao,
 │  dataDemissao, sexo, estadoCivil, endereco, numero, complemento, bairro,
 │  cep, salario, percentualComissao, observacao, ativo, criadoEm,
 │  atualizadoEm
 ├─ associação N:1 → Cidade (inacessível via API)
 └─ referenciado por: Agendamento (N:1)

Fornecedor
 ├─ id, fornecedor, cpfCnpj, endereco, bairro, cep, fone,
 │  inscricaoEstadual, ativo, criadoEm, atualizadoEm
 ├─ associação N:1 → Cidade (opcional)
 ├─ associação N:1 → CondicaoPagamento (opcional)
 └─ referenciado por: Compra, ContasPagar, NotaFiscalEntrada (N:1)

Servico
 ├─ id, nome, descricao, duracaoMin, preco, ativo, criadoEm, atualizadoEm
 └─ associação N:N ← Agendamento (via agendamento_servicos, unidirecional)

Agendamento
 ├─ id, dataHora, observacao, status, valorTotal, criadoEm, atualizadoEm
 ├─ associação N:1 → Cliente
 ├─ associação N:1 → Funcionario
 ├─ associação N:N → Servico (dono, via @JoinTable agendamento_servicos)
 └─ referenciado por: NotaFiscalServico (1:1)

FormaPagamento
 ├─ id, formaPagamento, percentual, numeroDias, ativo, criadoEm,
 │  atualizadoEm
 └─ associação 1:N → Parcela (inverso)

CondicaoPagamento
 ├─ id, condicao, multa, juro, desconto, ativo, criadoEm, atualizadoEm
 ├─ composição 1:N → Parcela (dono, cascade=ALL, orphanRemoval=true)
 └─ referenciada por: Fornecedor (N:1)

Parcela
 ├─ id, numeroParcela, diasVencimento, ativo, criadoEm, atualizadoEm
 ├─ associação N:1 → FormaPagamento (opcional)
 ├─ associação N:1 → CondicaoPagamento (opcional, lado "muitos" da
 │  composição acima)
 └─ referenciada por: ContasPagar, ContasReceber (N:1)

ContasPagar
 ├─ id, descricao, valor, dataVencimento, dataPagamento, situacao, ativo,
 │  criadoEm, atualizadoEm
 ├─ associação N:1 → Fornecedor
 └─ associação N:1 → Parcela (opcional)

ContasReceber
 ├─ id, descricao, valor, dataVencimento, dataRecebimento, situacao, ativo,
 │  criadoEm, atualizadoEm
 ├─ associação N:1 → Cliente
 └─ associação N:1 → Parcela (opcional)

Compra
 ├─ id, numeroCompra, dataCompra, valorTotal, observacao, status,
 │  criadoEm, atualizadoEm
 ├─ associação N:1 → Fornecedor
 ├─ composição 1:N → CompraItem (dono, cascade=ALL, orphanRemoval=true)
 └─ referenciada por: NotaFiscalEntrada (1:1)

CompraItem
 ├─ id, quantidade, precoUnitario, subtotal
 ├─ associação N:1 → Compra (lado "muitos" da composição acima)
 └─ associação N:1 → Produto

Venda
 ├─ id, numeroVenda, dataVenda, valorTotal, observacao, status, criadoEm,
 │  atualizadoEm
 ├─ associação N:1 → Cliente
 ├─ composição 1:N → VendaItem (dono, cascade=ALL, orphanRemoval=true)
 └─ referenciada por: NotaFiscalSaida (1:1)

VendaItem
 ├─ id, quantidade, precoUnitario, subtotal
 ├─ associação N:1 → Venda
 └─ associação N:1 → Produto

NotaFiscalEntrada
 ├─ id, numeroNota, serie, dataEmissao, chaveAcesso, valorTotal,
 │  transportadoraNome, veiculoPlaca, observacao
 ├─ associação 1:1 → Compra
 └─ associação N:1 → Fornecedor (cópia)

NotaFiscalSaida
 ├─ id, numeroNota, serie, dataEmissao, chaveAcesso, valorTotal,
 │  transportadoraNome, veiculoPlaca, observacao
 ├─ associação 1:1 → Venda
 └─ associação N:1 → Cliente (cópia)

NotaFiscalServico
 ├─ id, numeroNota, serie, dataEmissao, valorTotal, observacao
 ├─ associação 1:1 → Agendamento
 └─ associação N:1 → Cliente (cópia)
```

Sem herança entre entidades (nenhuma usa `@Inheritance`/`extends` de outra
`@Entity`); todas as relações são associação, agregação (`@ManyToOne`
simples) ou composição (`@OneToMany` com `cascade=ALL` + `orphanRemoval`).

---

## 7. DIAGRAMA DE SEQUÊNCIA (texto)

### 7.1 Cadastrar Cliente
```
Cliente HTTP → ClienteController.criar(ClienteDTO)
  ClienteController → ClienteService.salvar(dto)
    ClienteService → CpfCnpjValidator.validarCPF(cpf)         [se cpf informado]
    ClienteService → ClienteRepository.existsByCpf(cpf)       [se cpf informado]
      alt cpf inválido ou duplicado
        ClienteService --x RuntimeException("CPF inválido."/"CPF já cadastrado")
        ClienteController --x GlobalExceptionHandler → 400 {"mensagem": "..."}
      else válido
        ClienteService → CidadeRepository.findById(cidadeId)  [se informado]
        ClienteService → ClienteRepository.save(cliente)
          ClienteRepository → Hibernate/JPA → PostgreSQL (INSERT clientes)
        ClienteService --> ClienteController: Cliente salvo
        ClienteController --> Cliente HTTP: 201 Created + Cliente
```

### 7.2 Cadastrar e concluir Agendamento (com geração de NFS-e)
```
Cliente HTTP → AgendamentoController.criar(AgendamentoRequestDTO)
  → AgendamentoService.criar(dto)
    → ClienteRepository.findById(clienteId)      [erro "Cliente não encontrado" se ausente]
    → FuncionarioRepository.findById(funcionarioId) [erro "Funcionário não encontrado"]
    → ServicoRepository.findAllById(servicoIds)
    → calcula valorTotal = Σ preco dos serviços
    → AgendamentoRepository.save(status="AGENDADO")
  ← AgendamentoResponseDTO (201 Created)

Cliente HTTP → POST /agendamentos/{id}/confirmar
  → AgendamentoService.confirmar(id)
    → AgendamentoRepository.findById(id)  [erro "Agendamento não encontrado"]
    → valida status == "AGENDADO"         [senão erro 400]
    → save(status="CONFIRMADO")
  ← 200 OK

Cliente HTTP → POST /agendamentos/{id}/concluir
  → AgendamentoService.concluir(id)
    → valida status == "CONFIRMADO"       [senão erro 400]
    → save(status="CONCLUIDO")
  ← 200 OK

Cliente HTTP → POST /notas-fiscais-servico/gerar/{agendamentoId}
  → NotaFiscalServicoService.gerarParaAgendamento(agendamentoId)
    → AgendamentoRepository.findById(id)  [erro "Agendamento não encontrado"]
    → valida status == "CONCLUIDO"        [senão erro "NFS-e só pode ser gerada..."]
    → NotaFiscalServicoRepository.existsByAgendamentoId(id) [erro se true]
    → NotaFiscalServicoRepository.save(nota, sem numeroNota)
    → nota.numeroNota = "NFSE-" + format(id, 6)
    → NotaFiscalServicoRepository.save(nota)  [2º save]
  ← 201 Created + NotaFiscalServicoResponseDTO
```

### 7.3 Cadastrar, validar, cancelar e gerar NF-e de uma Compra
```
Cliente HTTP → POST /compras (CompraRequestDTO com itens)
  → CompraService.criar(dto)
    → FornecedorRepository.findById(fornecedorId) [erro "Fornecedor não encontrado"]
    → para cada item:
        → ProdutoRepository.findById(produtoId)   [erro "Produto não encontrado: <id>"]
        → subtotal = quantidade * precoUnitario
    → valorTotal = Σ subtotais
    → CompraRepository.save(compra, status="RASCUNHO", itens em cascata)
  ← 201 Created + CompraResponseDTO

Cliente HTTP → POST /compras/{id}/validar
  → CompraService.validar(id)
    → valida status == "RASCUNHO"           [senão erro 400]
    → valida itens não vazios               [senão erro "Compra deve ter ao menos um item"]
    → save(status="VALIDADA")
  ← 200 OK

Cliente HTTP → POST /compras/{id}/gerar-nfe
  → CompraService.gerarNfe(id)
    → valida status == "VALIDADA"           [senão erro "Nota fiscal só pode ser gerada..."]
    → NotaFiscalEntradaService.criarParaCompra(compra)
        → NotaFiscalEntradaRepository.save(nota, sem numeroNota)
        → nota.numeroNota = "NFE-" + format(id, 6)
        → NotaFiscalEntradaRepository.save(nota)  [2º save]
    → CompraRepository.save(compra, status="NFE_GERADA")
  ← 200 OK + NotaFiscalEntradaResponseDTO

Cliente HTTP → POST /compras/{id}/cancelar
  → CompraService.cancelar(id)
    → valida status != "NFE_GERADA"         [senão erro "Compra com nota fiscal gerada..."]
    → save(status="CANCELADA")
  ← 200 OK
```

### 7.4 Ciclo de Contas a Pagar (criar → pagar)
```
Cliente HTTP → POST /contas-pagar (ContasPagarRequestDTO)
  → ContasPagarService.criar(dto)
    → FornecedorRepository.findById(fornecedorId) [erro "Fornecedor não encontrado"]
    → ParcelaRepository.findById(parcelaId)       [se informado; erro "Parcela não encontrada"]
    → ContasPagarRepository.save(situacao="ABERTA")
  ← 201 Created

Cliente HTTP → POST /contas-pagar/{id}/pagar
  → ContasPagarService.pagar(id)
    → valida situacao != "CANCELADA"        [senão erro "Não é possível pagar uma conta cancelada"]
    → situacao = "PAGA"; dataPagamento = hoje
    → save
  ← 200 OK

Cliente HTTP → DELETE /contas-pagar/{id}
  → ContasPagarService.deletar(id)
    → valida situacao == "CANCELADA"        [senão erro "Só é possível excluir contas com situação CANCELADA"]
    → ContasPagarRepository.deleteById(id)
  ← 204 No Content
```

---

## 8. MÓDULOS DO SISTEMA

1. **Geografia** — País, Estado, Cidade (`modules.geo.pais/estado/cidade`)
2. **Categoria** (`modules.categoria`)
3. **Marca** (`modules.marca`)
4. **Unidade de Medida** (`modules.unidademedida`)
5. **NCM/SH** (`modules.ncmsh`)
6. **Produto** (`modules.produto`)
7. **Cliente** (`modules.cliente`)
8. **Funcionário** (`modules.funcionario`)
9. **Fornecedor** (`modules.fornecedor`)
10. **Serviço** (`modules.servico`)
11. **Agendamento** (`modules.agendamento`)
12. **Forma de Pagamento** (`modules.pagamento` — `FormaPagamento`)
13. **Condição de Pagamento** (`modules.pagamento` — `CondicaoPagamento`)
14. **Parcela** (`modules.pagamento` — `Parcela`)
15. **Contas a Pagar** (`modules.financeiro` — `ContasPagar`)
16. **Contas a Receber** (`modules.financeiro` — `ContasReceber`)
17. **Compra** (`modules.compra` — `Compra` + `CompraItem`)
18. **Venda** (`modules.venda` — `Venda` + `VendaItem`)
19. **Nota Fiscal de Entrada** (`modules.fiscal.entrada`)
20. **Nota Fiscal de Saída** (`modules.fiscal.saida`)
21. **Nota Fiscal de Serviço / NFS-e** (`modules.fiscal.servico`)

Componentes transversais de suporte (não são módulos de domínio):
`com.salao.config` (CORS, tratamento global de exceções) e `com.salao.util`
(validação de CPF/CNPJ).

---

## 9. Observações finais e débito técnico (para contextualização acadêmica)

- Diversos módulos apresentam **inconsistências deliberadas ou acidentais**
  entre criação e atualização (checagem de duplicidade só na criação,
  tratamento de nulo assimétrico em `ativo`, tolerância a FK inválida
  variando por módulo). Essas inconsistências foram documentadas em cada
  seção de regras de negócio (§3) por serem parte do comportamento real
  implementado, não hipóteses.
- Alguns módulos (`Categoria`, `Cliente`, `Funcionario`, `Servico`) expõem a
  **entidade JPA diretamente** pela API REST em vez de um Response DTO,
  divergindo do padrão predominante nos demais 17 módulos.
- Há **divergências entre as migrations Flyway existentes e as entidades
  JPA atuais** (campos `juro`, `numero_parcela`, `dias_vencimento`,
  colunas de `fornecedores`, tabelas `marcas`/`unidades_medida`) — como o
  Flyway está desabilitado e o Hibernate está em modo `validate`, essas
  divergências só não quebram a aplicação porque o schema real do banco em
  uso não é gerado a partir dessas migrations.
- Nenhuma integração de estoque (Produto.quantidade) com Compra/Venda, nem
  geração automática de Contas a Pagar/Receber a partir da validação de
  Compra/Venda — ambos os fluxos são inteiramente manuais e desacoplados.
- Todas as mensagens de erro de negócio seguem o padrão de resposta
  `{"mensagem": "..."}` com HTTP 400, centralizado em
  `GlobalExceptionHandler`.
