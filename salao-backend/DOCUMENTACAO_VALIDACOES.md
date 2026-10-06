# Documentação de Validações — Sistema Salão Bella

> Levantamento feito lendo o código-fonte atual em `salao-backend/src/main/java/com/salao/modules` (25-09-2026), incluindo alterações ainda não commitadas. Cobre as duas camadas de validação do sistema: **Bean Validation** (anotações nos `RequestDTO`, verificadas antes de o request chegar no Service) e **regras de negócio** (verificadas nos `Service`, lançando `RuntimeException`).

## Como o sistema responde a um erro

- **Bean Validation falhou** (`@NotBlank`, `@Pattern`, etc. no DTO): Spring retorna `400 Bad Request` com os detalhes de binding (um erro por campo), porque `server.error.include-binding-errors=always`.
- **Regra de negócio falhou** (`Service` lança `RuntimeException`): `GlobalExceptionHandler` intercepta e converte para `400 Bad Request` com corpo `{"mensagem": "<mensagem exata da exceção>"}`. Todas as mensagens abaixo são citadas literalmente do código — é o texto que aparece pro usuário.
- Exceção: alguns `deletar()` chamam `repository.deleteById(id)` direto, sem checar se o registro existe antes. Se o id não existir, o Spring lança `EmptyResultDataAccessException`, que **não** passa pelo tratamento amigável — vira `500` em vez de `400`. Isso acontece hoje em **Cliente**, **Funcionário** e **Serviço**.

---

## Localização

### País (`/api/paises`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório, até 100 caracteres | "Nome do país é obrigatório" |
| `sigla` | obrigatório, 2 a 3 letras | "Sigla é obrigatória" / "Sigla deve ter 2 ou 3 letras" |
| `nacionalidade`, `moeda` | opcionais, até 100/50 caracteres | — |

- `sigla` é convertida para **maiúsculas** antes de salvar/comparar.
- `sigla` única, ignorando o próprio registro na edição: **"Sigla já cadastrada para outro país"**.
- Excluir é bloqueado se houver Estados vinculados: **"Não é possível excluir: o país possui estados vinculados"**.
- Id inexistente: **"País não encontrado"**.

### Estado (`/api/estados`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório, até 100 caracteres | "Nome é obrigatório" |
| `uf` | obrigatório, exatamente 2 letras | "UF é obrigatória" / "UF deve ter exatamente 2 letras" |
| `paisId` | obrigatório no formulário | "País é obrigatório" |

- `uf` convertida para maiúsculas; única, ignorando o próprio registro: **"UF já cadastrada para outro estado"**.
- **Inconsistência**: na criação, se `paisId` não corresponder a um país existente, lança **"País não encontrado"**; na edição, o mesmo caso é **ignorado silenciosamente** (o país simplesmente não é alterado).
- Excluir bloqueado se houver Cidades vinculadas: **"Não é possível excluir: o estado possui cidades vinculadas"**.
- Id inexistente: **"Estado não encontrado"**.

### Cidade (`/api/cidades`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório, até 100 caracteres | "Nome é obrigatório" |
| `estadoId` | obrigatório no formulário | "Estado é obrigatório" |

- Nome único **dentro do mesmo estado** (case-insensitive): **"Essa cidade já está cadastrada para o estado selecionado"**.
- Mesma inconsistência de Estado/País: `estadoId` inexistente lança **"Estado não encontrado"** na criação, mas é ignorado silenciosamente na edição.
- Excluir bloqueado **apenas** se houver Clientes vinculados: **"Não é possível excluir: a cidade possui clientes vinculados"** — não verifica Funcionários nem Fornecedores, que também referenciam Cidade.
- Id inexistente: **"Cidade não encontrada"**.

---

## Cadastros gerais

### Categoria (`/api/categorias`)
- `nome`: obrigatório, 3 a 60 caracteres — **"Nome da categoria é obrigatório"** / **"Nome da categoria deve ter entre 3 e 60 letras"**.
- Nome único (case-insensitive), verificado na criação **e** na edição: **"Categoria já cadastrada"**.
- `ativo` é sobrescrito sem checar nulo na edição (pode virar `null`).
- Excluir bloqueado se houver Produtos vinculados: **"Não é possível excluir: existem produtos vinculados a esta categoria"**.
- Id inexistente: **"Categoria não encontrada"**.

### Marca (`/api/marcas`)
- `marca`: obrigatório — **"Nome da marca é obrigatório"**.
- Nome único (case-insensitive), criação e edição: **"Marca já cadastrada"**.
- Excluir bloqueado se houver Produtos vinculados: **"Não é possível excluir: existem produtos vinculados a esta marca"**.
- Id inexistente: **"Marca não encontrada"**.

### Unidade de Medida (`/api/unidades-medida`)
- `unidadeMedida`, `sigla`: obrigatórios — **"Nome da unidade é obrigatório"** / **"Sigla é obrigatória"**.
- `sigla` única (case-insensitive), criação e edição: **"Já existe uma unidade de medida com essa sigla"**.
- Excluir bloqueado se houver Produtos vinculados: **"Não é possível excluir: existem produtos vinculados a esta unidade de medida"**.
- Id inexistente: **"Unidade de medida não encontrada"**.

### NCM/SH (`/api/ncm-sh`)
- `codigo`: obrigatório, formato `9999.99.99` — **"Código NCM/SH é obrigatório"** / **"Código NCM/SH inválido (formato esperado: 9999.99.99)"** (regex `\d{4}\.?\d{2}\.?\d{2}`, os pontos são opcionais).
- `codigo` único (comparação **exata**, case-sensitive), criação e edição: **"Código NCM/SH já cadastrado"**.
- Excluir bloqueado se houver Produtos vinculados: **"NCM/SH possui produtos vinculados e não pode ser excluído"**.
- Id inexistente: **"NCM/SH não encontrado"**.

### Classificação de Conta (`/api/classificacoes-conta`)
- `nome`: obrigatório, 3 a 60 caracteres — **"Nome da classificação é obrigatório"** / **"Nome da classificação deve ter entre 3 e 60 letras"**.
- Nome único (case-insensitive), criação e edição: **"Classificação da conta já cadastrada"**.
- Excluir bloqueado se houver itens de Nota de Entrada vinculados: **"Não é possível excluir: existem itens de notas de entrada vinculados a esta classificação"**.
- Id inexistente: **"Classificação da conta não encontrada"**.
- **Uso obrigatório na Nota de Entrada**: todo item da nota precisa de uma classificação; se ela estiver marcada como inativa, o lançamento do item é bloqueado: **"Classificação da conta inativa: \<nome\>"**.

---

## Produto e Estoque

### Produto (`/api/produtos`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório | "Nome do produto é obrigatório" |
| `precoVenda` | obrigatório, maior que zero | "Valor de venda é obrigatório" / "Valor de venda deve ser maior que zero" |
| `precoCusto` | opcional, não negativo | "Preço de custo não pode ser negativo" |
| `quantidade` | opcional, não negativo | "Quantidade não pode ser negativa" |
| `desconto` | opcional, 0 a 100% | "Desconto deve estar entre 0 e 100%" |
| `ncmShId`, `marcaId`, `unidadeMedidaId`, `categoriaId` | opcionais | — |

- Nome único (case-insensitive), verificado **só na criação**: **"Produto já cadastrado"** — na edição é possível renomear para um nome já existente sem erro de aplicação (só quebraria por constraint do banco).
- `desconto`: default `0` na criação se omitido; na edição só é sobrescrito se vier preenchido (mantém o valor anterior).
- `quantidade` e `ativo`: sobrescritos **sem** checar nulo na edição (podem virar `null`).
- Vínculos opcionais com NCM/SH, Marca, Unidade de Medida e Categoria: id informado e inexistente → **"NCM/SH não encontrado"** / **"Marca não encontrada"** / **"Unidade de medida não encontrada"** / **"Categoria não encontrada"**.
- **Sem** verificação de vínculo com itens de Nota de Entrada/Venda ao excluir — risco de erro de integridade do banco se o produto já foi movimentado.
- O campo `quantidade` (estoque) pode ser editado diretamente aqui, mas na operação normal do sistema ele é **atualizado automaticamente** pelas Movimentações de Estoque (ver abaixo) — editar manualmente pode dessincronizar do histórico de movimentações.

### Estoque (`/api/estoque`) — somente leitura
Não existe cadastro manual de movimentação. Toda movimentação é gerada **automaticamente**:
- ao **confirmar uma Nota de Entrada** → uma movimentação `ENTRADA` por item, com o custo unitário (`custoFinal`).
- ao gerar a **Nota Fiscal de Saída** de uma Venda → uma movimentação `SAIDA` por item.

Regras:
- `ENTRADA`: soma a quantidade ao saldo do produto, sem restrição.
- `SAIDA`: verifica se o saldo ficaria negativo antes de debitar — se sim, bloqueia com **"Estoque insuficiente para o produto \<nome\>"**. Isso barra a geração da NF de Saída (e portanto a venda) inteira, não só o item.
- A quantidade é guardada com até 3 casas decimais na movimentação, mas o saldo do produto (`Produto.quantidade`) é `Integer` — o delta é arredondado (`HALF_UP`) antes de aplicar.
- Cada movimentação registra o saldo anterior e o posterior do produto, o custo unitário (entradas) e o documento de origem (`NOTA_ENTRADA`/`VENDA`).

---

## Pessoas

### Cliente (`/api/clientes`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório, 3 a 50 caracteres | "Nome do cliente é obrigatório" / "Nome deve ter entre 3 e 50 caracteres" |
| `email` | obrigatório, formato de e-mail | "E-mail é obrigatório" / "E-mail inválido" |
| `telefone` | obrigatório, formato `(00) 00000-0000` | "Telefone é obrigatório" / "Telefone inválido" |
| `endereco`, `numero`, `bairro` | obrigatórios | "\<campo\> é obrigatório" |
| `cep` | obrigatório, formato `00000-000` | "CEP é obrigatório" / "CEP inválido" |
| `dataNascimento` | opcional, não pode ser futura | "Data de nascimento não pode ser futura" |
| `cidadeId` | obrigatório no formulário | "Cidade é obrigatória" |
| `cpf`, `rg` | livres, sem regra de formato no DTO | — |

- `cpf` (se informado): validado por dígito verificador (algoritmo módulo 11) → **"CPF inválido."**; duplicidade checada **só na criação** → **"CPF já cadastrado"** (na edição o dígito é revalidado, mas duplicidade não).
- `cidade`: apesar do formulário marcar como obrigatória, o Service é tolerante — se o id não existir, o cliente é salvo **sem** cidade na criação, e a cidade **atual é mantida** na edição (não é zerada).
- **Sem** checagem de vínculo ao excluir (Agendamentos, Contas a Receber, Notas Fiscais e Vendas referenciam Cliente) — risco de erro de integridade do banco, e o `deleteById` direto pode devolver `500` em vez de `400`.
- Retorna a entidade JPA diretamente na API (sem Response DTO dedicado).

### Funcionário (`/api/funcionarios`)
| Campo | Regra | Mensagem |
|---|---|---|
| `nome` | obrigatório | "Nome do funcionário é obrigatório" |
| `email` | obrigatório, formato de e-mail | "E-mail é obrigatório" / "E-mail inválido" |
| `telefone` | obrigatório, formato BR | "Telefone é obrigatório" / "Telefone inválido" |
| `cep` | obrigatório, formato `00000-000` | "CEP é obrigatório" / "CEP inválido" |
| `dataAdmissao` | obrigatória, não pode ser futura | "Data de admissão é obrigatória" / "Data de admissão não pode ser futura" |
| `dataNascimento` | opcional, não pode ser futura | "Data de nascimento não pode ser futura" |
| `salario` | opcional, não negativo | "Salário não pode ser negativo" |
| `percentualComissao` | opcional, 0 a 100% | "Comissão deve estar entre 0 e 100%" |

- `cpf` (se informado): mesma validação de dígito verificador + duplicidade só na criação — **"CPF inválido."** / **"CPF já cadastrado"**.
- **Idade mínima de 16 anos na admissão** (regra CLT, fora jovem aprendiz): se `nascimento + 16 anos` for depois da `dataAdmissao` → **"Funcionário precisa ter pelo menos 16 anos na data de admissão."**.
- Data de demissão não pode ser anterior à admissão: **"Data de demissão não pode ser anterior à data de admissão."**.
- O campo `cidade` existe na entidade mas nunca é preenchido (nem no formulário, nem no Service) — sempre fica `null`.
- **Sem** checagem de vínculo ao excluir (Agendamentos referenciam Funcionário); `deleteById` direto pode devolver `500`.
- Retorna a entidade JPA diretamente.

### Fornecedor (`/api/fornecedores`)
| Campo | Regra | Mensagem |
|---|---|---|
| `fornecedor` (nome) | obrigatório | "Nome do fornecedor é obrigatório" |
| `cep` | obrigatório, formato `00000-000` | "CEP é obrigatório" / "CEP inválido" |
| `fone` | opcional, mas se informado precisa bater o formato | "Telefone inválido" |
| `cpfCnpj` | opcional, sem regra de formato no formulário (validado no Service) | — |

- `cpfCnpj` (se informado): se tiver 11 dígitos é validado como CPF (**"CPF inválido."**), senão como CNPJ (**"CNPJ inválido."**) — atenção: um valor com quantidade de dígitos diferente de 11 e de 14 cai no ramo CNPJ e retorna "CNPJ inválido." mesmo não sendo uma tentativa de CNPJ.
- **Sem** checagem de duplicidade de `cpfCnpj`.
- `cidade`: opcional, mas **não tolerante** — id informado e inexistente → **"Cidade não encontrada"** (tanto ao criar quanto ao editar).
- `condicaoPagamento`: opcional, id inexistente → **"Condição de pagamento não encontrada"**.
- Excluir bloqueado se houver Contas a Pagar vinculadas: **"Fornecedor possui contas a pagar vinculadas e não pode ser excluído"**.
- Id inexistente: **"Fornecedor não encontrado"**.
- A Transportadora tem cadastro próprio (`/api/transportadoras`) e é escolhida na Nota de Entrada; não pode ser excluída enquanto houver nota vinculada.

---

## Serviços e Agendamento

### Serviço (`/api/servicos`)
- `nome`: obrigatório — **"Nome do serviço é obrigatório"**.
- `duracaoMin`: obrigatória, maior que zero — **"Duração é obrigatória"** / **"Duração deve ser maior que zero"**.
- `preco`: obrigatório, maior que zero — **"Preço é obrigatório"** / **"Preço deve ser maior que zero"**.
- Nome único (case-insensitive), criação e edição: **"Serviço já cadastrado"**.
- **Sem** checagem de vínculo com Agendamentos ao excluir — se o serviço estiver em uso, a exclusão falha por violação de chave estrangeira no banco (`500`, não `400` amigável), pois não há `deleteById` protegido.
- Retorna a entidade JPA diretamente.

### Agendamento (`/api/agendamentos`)
- `dataHora`, `clienteId`, `funcionarioId`: obrigatórios.
- `servicoIds`: pelo menos 1 — **"Selecione pelo menos um serviço"**.
- **Data/hora não pode ser no passado**: **"Data/hora do agendamento não pode ser no passado."**.
- Cliente deve existir: **"Cliente não encontrado"**. Funcionário deve existir: **"Funcionário não encontrado"**.
- **Todos** os serviços selecionados precisam existir — se algum id não for encontrado, bloqueia com **"Um ou mais serviços selecionados não foram encontrados."**.
- `valorTotal` é sempre recalculado no backend somando o preço de cada serviço (nunca confia em valor vindo do cliente).
- `atualizar()` **não** tem trava de status — pode editar (recalculando tudo) em qualquer estado do agendamento.
- Máquina de estados `AGENDADO → CONFIRMADO → CONCLUIDO`, com `CANCELADO` à parte:
  - **Confirmar**: só a partir de `AGENDADO`, senão **"Só é possível confirmar agendamentos com status AGENDADO"**.
  - **Concluir**: só a partir de `CONFIRMADO`, senão **"Só é possível concluir agendamentos com status CONFIRMADO"**.
  - **Cancelar**: bloqueado se já `CONCLUIDO` ou `CANCELADO` → **"Não é possível cancelar agendamento com status \<status atual\>"**.
  - **Excluir**: só permitido com status `CANCELADO`, senão **"Só é possível excluir agendamentos com status CANCELADO"** (exclusão física).
- Uma vez `CONCLUIDO`, libera a geração de NFS-e (ver Nota Fiscal de Serviço).

---

## Financeiro

### Forma de Pagamento (`/api/formas-pagamento`)
- `formaPagamento`: obrigatória — **"Forma de pagamento é obrigatória"**.
- `percentual`: opcional, 0 a 100% — **"Percentual deve estar entre 0 e 100"**.
- `numeroDias`: opcional, não negativo — **"Número de dias não pode ser negativo"**.
- Descrição única (case-sensitive), verificada na criação e edição: **"Forma de pagamento já cadastrada"**.
- Defaults se omitidos: `percentual = 0`, `numeroDias = 0`, `ativo = true`.
- Excluir bloqueado se houver Parcelas vinculadas: **"Não é possível excluir: existem parcelas vinculadas a esta forma de pagamento"**.

### Condição de Pagamento (`/api/condicoes-pagamento`)
- `condicao` (nome): obrigatória — **"Condição de pagamento é obrigatória"**.
- `multa`, `juro`, `desconto`: opcionais, default `0` se omitidos.
- `parcelas`: lista obrigatória, **precisa ter pelo menos uma parcela**: **"Adicione pelo menos uma parcela."**.
- Nome único, verificado só na criação: **"Condição de pagamento já cadastrada"**.
- **Tela**: o campo **Nº de Parcelas** (1 a 60) gera as linhas automaticamente: percentual dividido igualmente com 2 casas (a última fica com a sobra: 3 parcelas = 33,33 + 33,33 + 33,34), vencimentos de 30 em 30 dias (ou no mesmo intervalo das parcelas já preenchidas) e a forma de pagamento da parcela anterior. Mudar o número mantém dias e forma das parcelas que já existiam e redivide o percentual. A forma escolhida na 1ª parcela é copiada para as que estão sem forma. Tudo continua editável linha a linha.
- **A soma dos percentuais de todas as parcelas precisa ser exatamente 100%**, senão: **"A soma dos percentuais das parcelas deve ser exatamente 100% (atual: \<soma\>%)."** — validado tanto na criação quanto na edição.
- Cada parcela: `diasVencimento` obrigatório e não negativo, `percentual` entre 0 e 100 (opcional, default 0), `formaPagamentoId` **obrigatório** — **"Dias para vencimento da parcela é obrigatório"** / **"Percentual deve estar entre 0 e 100"** / **"Forma de pagamento da parcela é obrigatória"**; se o id de forma de pagamento não existir: **"Forma de pagamento não encontrada"**.
- **Editar substitui todas as parcelas**: a coleção antiga é apagada fisicamente (`orphanRemoval`) e recriada do payload — qualquer parcela não reenviada é perdida, e as reenviadas viram registros novos (novos ids).
- Excluir a condição exclui em cascata todas as suas parcelas (sem checar se há Fornecedores vinculados).
- **É o "molde" de Contas a Pagar/Receber**: ao confirmar uma Nota de Entrada (ou gerar a NF-e de uma Venda) com condição de pagamento vinculada, o desconto/multa/juro/parcelas dessa condição são copiados para as contas geradas (ver Nota de Entrada/Venda e Baixa abaixo).

### Contas a Pagar (`/api/contas-pagar`) e Contas a Receber (`/api/contas-receber`)
As duas telas são espelho uma da outra (Fornecedor↔Cliente, `pagar`↔`receber`, `PAGA`↔`RECEBIDA`, `dataPagamento`↔`dataRecebimento`).

| Campo | Regra | Mensagem |
|---|---|---|
| `descricao` | obrigatória | "Descrição é obrigatória" |
| `valor` | obrigatório, maior que zero | "Valor é obrigatório" / "Valor deve ser maior que zero" |
| `dataVencimento` | obrigatória | "Data de vencimento é obrigatória" |
| `fornecedorId` / `clienteId` | obrigatório | "Fornecedor é obrigatório" / "Cliente é obrigatório" |
| `parcelaId` | opcional | — |

- Fornecedor/Cliente deve existir: **"Fornecedor não encontrado"** / **"Cliente não encontrado"**. Parcela, se informada, deve existir: **"Parcela não encontrada"**.
- Ao lançar (ou trocar a parcela de) uma conta vinculada a uma Parcela, os percentuais de desconto/multa/juro da Condição de Pagamento daquela parcela são **copiados** para a conta — alterar a condição depois **não** afeta contas já lançadas.
- Situação inicial sempre `ABERTA`.
- **Editar só é permitido com situação `ABERTA`**: **"Só é possível editar contas em aberto"**.
- **Pagar/Receber**:
  - bloqueado se `CANCELADA`: **"Não é possível pagar uma conta cancelada"** / **"Não é possível receber uma conta cancelada"**.
  - bloqueado se já paga/recebida (não é mais idempotente): **"Esta conta já foi paga"** / **"Esta conta já foi recebida"**.
  - a data de pagamento/recebimento **não pode ser futura**: **"Data de pagamento não pode ser futura"** / **"Data de recebimento não pode ser futura"** (se omitida, assume hoje).
  - o valor final é calculado pela regra de Baixa (ver abaixo) e persistido junto com a conta.
- **Cancelar**: bloqueado se já paga/recebida: **"Não é possível cancelar uma conta já paga"** / **"...já recebida"**.
- **Excluir**: só permitido com situação `CANCELADA`, senão **"Só é possível excluir contas com situação CANCELADA"** (exclusão física).

### Baixa (pagamento/recebimento) — regra `CalculoBaixa`
Regra única, compartilhada por Contas a Pagar e Contas a Receber, disponível também como prévia via `GET /{id}/calculo-baixa?data=`:

- **Em dia** (data da baixa = data de vencimento, sem atraso): aplica o **desconto** da condição sobre o valor da conta. No caso de condição "à vista" (vencimento = data de emissão), isso equivale a um desconto à vista.
- **Em atraso** (data da baixa depois do vencimento): **perde o desconto** e passa a cobrar:
  - **multa fixa**, aplicada uma única vez sobre o valor da conta;
  - **juro proporcional**, calculado como `valor × juro% × dias_de_atraso / (100 × 30)` — ou seja, a taxa de juro é "ao mês" e é dividida proporcionalmente pelos dias corridos de atraso (usando mês comercial de 30 dias).
- Todos os arredondamentos são `HALF_UP` com 2 casas decimais.
- O valor final é `valor − desconto + multa + juro`.

---

## Fiscal

### Pedido de Compra (`/api/pedidos-compra`)
Identificado pela **chave composta (modelo, série, número, fornecedor)** — não existe ID. Na URL: `/{modelo}/{serie}/{numero}/{fornecedorId}`.

| Campo | Regra | Mensagem |
|---|---|---|
| `modelo`, `serie`, `numero` | obrigatórios, inteiros maiores que zero | "Modelo do pedido é obrigatório" etc. |
| `fornecedorId` | obrigatório, existente e ativo | "Fornecedor não encontrado." / "Fornecedor inativo." |
| `dataPedido` | obrigatória, não pode ser futura | "Data do pedido não pode ser posterior à data atual." |
| `condicaoPagamentoId` | opcional; na tela vem preenchida com a condição do fornecedor, mas pode ser trocada | "Condição de pagamento não encontrada." |
| `valorFrete`, `valorSeguro`, `outrasDespesas` | ≥ 0, até 2 decimais (vazio = 0) | "Valor do frete não pode ser negativo" etc. |
| `observacoes` | até 500 caracteres | "Observações deve ter no máximo 500 caracteres" |
| `itens` | pelo menos 1; produto ativo e sem repetição; quantidade > 0; valor unitário ≥ 0 | "Adicione pelo menos um produto ao pedido" / "O produto X aparece mais de uma vez no pedido." |
| item `classificacaoContaId` | obrigatória e ativa | "Classificação da conta do item é obrigatória" / "Classificação da conta inativa: X" |
| item `descontoPercentual` | entre 0 e 100 (vazio = 0) | "Desconto deve estar entre 0 e 100%" |

- Chave duplicada: **"Já existe um pedido de compra com este modelo/série/número para este fornecedor."**
- **Valores calculados no backend**, igual à nota: valor bruto do item = quantidade × valor unitário; desconto em R$ = bruto × percentual; valor c/ desconto = bruto − desconto. No cabeçalho: **produtos bruto**, **total de desconto** (soma dos itens), **produtos líquido**, frete, seguro, outras despesas e **valor total da compra** = líquido + frete + seguro + outras.
- Na tela o desconto pode ser digitado **em % ou em R$** (um calcula o outro); o que vai para o servidor é o percentual com 2 casas, e a tela já mostra o valor exatamente como o servidor vai gravar.
- Pedidos gravados antes de 02/10/2026 não têm classificação nos itens: ao editar, a tela pede a classificação de cada item antes de salvar.
- **Situação calculada** a partir da `quantidadeRecebida` de cada item: **ABERTA** (nada recebido), **PARCIAL** (algum item recebido) e **CONCLUIDA** (todos com `quantidadeRecebida ≥ quantidade`).
- Só pode ser **alterado** enquanto nenhum item foi recebido: **"Pedido de compra já possui itens recebidos e não pode ser alterado."**
- A data do pedido não pode passar a ser depois da emissão de uma nota já vinculada: **"Data do pedido não pode ser posterior à emissão da nota de entrada vinculada (dd/mm/aaaa)."**
- Só pode ser **excluído** se ABERTA e sem nota de entrada vinculada: **"Pedido de compra possui notas de entrada vinculadas e não pode ser excluído."**

### Nota de Entrada (`/api/notas-entrada`)
Identificada pela **chave composta (modelo, série, número, fornecedor)** — **não existe ID artificial**. Na URL: `/{modelo}/{serie}/{numero}/{fornecedorId}`. Substitui o antigo fluxo Compra → NF-e automática.

| Campo | Regra | Mensagem |
|---|---|---|
| `modelo`, `serie`, `numero` | obrigatórios, inteiros > 0 | "Modelo é obrigatório" / "Série é obrigatória" / "Número é obrigatório" |
| `fornecedorId` | obrigatório, existente e ativo (na criação) | "Fornecedor não encontrado." / "Fornecedor inativo." |
| `dataEmissao` | obrigatória, não pode ser futura | "Data de emissão não pode ser posterior à data atual." |
| `dataChegada` | opcional; ≥ emissão e ≤ hoje (igual à emissão é permitido) | "Data de chegada não pode ser anterior à data de emissão." / "…posterior à data atual." |
| `tipoFrete` | `CIF` ou `FOB` | "Tipo de frete deve ser CIF ou FOB" |
| `valorFrete`, `valorSeguro`, `outrasDespesas` | ≥ 0, até 2 decimais | "Valor do frete não pode ser negativo" etc. |
| `placaVeiculo` | formato `ABC-1234` ou `ABC1D23` (gravada em maiúsculas) | "Placa inválida (use ABC-1234 ou ABC1D23)" |
| `condicaoPagamentoId`, `transportadoraId` | quando informados, existentes (transportadora também ativa) | "Condição de pagamento não encontrada." / "Transportadora inativa." |
| `pedidoNumero`, `pedidoSerie`, `pedidoModelo` | os três juntos ou nenhum; o pedido precisa ser **do mesmo fornecedor** da nota | "Para vincular um Pedido de Compra informe número, série e modelo do pedido." / "Pedido de Compra … não encontrado para este fornecedor." |
| `dataEmissao` com pedido vinculado | não pode ser anterior à data do pedido (no mesmo dia é permitido); na tela, o calendário já começa na data do pedido | "Data de emissão não pode ser anterior à data do Pedido de Compra (dd/mm/aaaa)." |
| `situacao` | **não vem do cliente**: toda nota nova nasce `PENDENTE` | — |

Itens (`NotaEntradaItemRequestDTO`): `produtoId` (ativo) e `classificacaoContaId` (ativa) obrigatórios; `quantidade` > 0 (até 7 inteiros e 3 decimais); `valorUnitario` ≥ 0; `descontoPercentual` entre 0 e 100. **O mesmo produto não pode aparecer duas vezes**: **"O produto X aparece mais de uma vez nesta nota."**

Regras de negócio (`NotaEntradaService`):
- **Chave única**: **"Já existe uma nota de entrada com este modelo/série/número para este fornecedor."** (o mesmo número é permitido para outro fornecedor, porque o fornecedor faz parte da chave).
- **A chave nunca muda**: no `PUT` a chave do corpo precisa ser igual à da URL — **"A chave da nota (modelo, série, número e fornecedor) não pode ser alterada."**
- **A classificação da conta de um item já salvo não pode ser trocada**: **"A classificação da conta de um item já adicionado não pode ser alterada (produto X)."**
- **Cálculos sempre no backend** (nunca confia em total enviado): valor do item = quantidade × valor unitário; desconto em valor = valor × percentual; **frete, seguro e outras despesas são rateados proporcionalmente ao valor líquido de cada item** (o último absorve o arredondamento); `custoFinal` = custo **unitário** = (valor − desconto + rateios) ÷ quantidade; `valorTotal` = produtos − desconto + frete + seguro + outras despesas.
- **Situações**: `PENDENTE` → pode **editar**, **excluir** e **confirmar**; `CONFERIDA` → só leitura. Qualquer outra operação: **"Somente notas PENDENTES podem ser editadas / excluídas / confirmadas."**
- **Editar** (PENDENTE): atualiza o cabeçalho e os itens; se a nota era ligada a um pedido, **primeiro desfaz o recebimento anterior** (`quantidadeRecebida = GREATEST(quantidadeRecebida − qtd, 0)`), troca os itens e **aplica o novo recebimento**, recalculando a situação do pedido — tudo na mesma transação.
- **Criar** ligada a um pedido: soma a quantidade da nota em `quantidadeRecebida` de cada produto (produto fora do pedido: **"O produto X não faz parte do Pedido de Compra …"**) e recalcula a situação do pedido.
- **Excluir** (PENDENTE): reverte o recebimento do pedido (se houver), apaga itens e nota.
- **Confirmar** (PENDENTE, linha travada com `SELECT … FOR UPDATE`), numa **única transação**:
  1. a nota precisa ter produtos — **"A nota não pode ser confirmada porque não possui produtos."**;
  2. valor total > 0; cada item com quantidade > 0 e **custo > 0** (usa `custoFinal` quando > 0, senão o valor unitário) — **"Produto X: o custo deve ser maior que zero."**;
  3. **dá entrada no estoque** de cada produto, registrando no histórico o saldo anterior, o saldo posterior, o custo e o documento (`Entrada da Nota {número}/{série} - Fornecedor {id}`);
  4. **gera as Contas a Pagar** pela condição de pagamento (uma por parcela, a última absorve o arredondamento, vencimento = data de emissão + dias da parcela; sem condição, uma conta na data de emissão) — copiando multa, juro e desconto da condição;
  5. passa a nota para `CONFERIDA` e preenche a `dataChegada` com a data atual se estiver vazia.
  Se qualquer etapa falhar, **nada é gravado** (rollback). A entrada em estoque e as contas a pagar **só acontecem na confirmação**, nunca ao salvar.
- **Log** (`/api/logs`): registra CRIOU, EDITOU, CONFIRMOU e EXCLUIU (para Nota de Entrada e Pedido de Compra).
- **Gerar Parcelas (prévia)**: `GET /api/condicoes-pagamento/{id}/parcelas?valor=&data=` devolve as parcelas (número, dias, vencimento, forma de pagamento, %, valor) **sem gravar nada**. Usa o mesmo cálculo da confirmação (`GeradorParcelas`), então as contas a pagar geradas ao confirmar são exatamente as da prévia. Erros: **"O valor total deve ser maior que zero para gerar as parcelas."** / **"Informe a data de emissão para gerar as parcelas."** Na tela, antes de gerar confere emissão/chegada/placa, se há produto em edição e se todos os itens têm classificação; **depois de gerar, a nota fica bloqueada** (só ficam liberados Salvar, Salvar e Confirmar e a lixeira dos produtos). **Remover um produto descarta as parcelas e destrava a nota** para novas alterações.
- **Tela**: fornecedor e transportadora são escolhidos num **popup de busca** (só cadastros ativos), não digitados; data de emissão e de chegada ficam na "Identificação da Nota", ao lado do fornecedor. Ao escolher um **Pedido de Compra**, a nota recebe o fornecedor, a condição de pagamento, os produtos ainda não recebidos (quantidade que falta, valor unitário, desconto e classificação do pedido) e — se o pedido ainda está ABERTO — o frete/seguro/outras despesas do pedido; tudo pode ser ajustado antes de salvar.
- No banco: chaves primárias compostas, `CHECK` de situação/frete, e uma chave estrangeira composta que obriga o pedido a ser do mesmo fornecedor da nota.

### Venda (`/api/vendas`) — fluxo próprio (RASCUNHO → VALIDADA → NFE_GERADA)
| Campo | Regra | Mensagem |
|---|---|---|
| `dataVenda` | obrigatória | "Data da venda é obrigatória" |
| `clienteId` | obrigatório | "Cliente é obrigatório" |
| `condicaoPagamentoId` | opcional | — |
| `itens` | pelo menos 1 | "Adicione pelo menos um item" |

Cada item (`VendaItemRequestDTO`): `produtoId` obrigatório, `quantidade` obrigatória e maior que zero, `precoUnitario` obrigatório e não negativo. **Diferente da Nota de Entrada, a Venda não tem** desconto por item, classificação de conta, nem rateio de frete/seguro/outros gastos.

Regras de negócio (`VendaService`):
- Data da venda não pode ser posterior a hoje: **"Data da venda não pode ser posterior à data atual"**.
- Cliente deve existir: **"Cliente não encontrado"**. Condição de pagamento, se informada, deve existir: **"Condição de pagamento não encontrada"**.
- Cada item: produto deve existir (**"Produto não encontrado: \<id\>"**). Subtotal = `quantidade × preço unitário`; total sempre recalculado no backend.
- Máquina de estados (`RASCUNHO → VALIDADA → NFE_GERADA`, `CANCELADA` à parte):
  - **Editar**: só em `RASCUNHO` — **"Venda não pode ser editada no status atual"**.
  - **Validar**: exige item — **"Venda deve ter ao menos um item"** / **"Venda não pode ser validada no status atual"**.
  - **Gerar NF-e**: só em `VALIDADA` — **"Nota fiscal só pode ser gerada para vendas validadas"** — gera a Nota Fiscal de Saída, **debita o Estoque** de cada item (aqui é onde pode disparar **"Estoque insuficiente para o produto \<nome\>"** se não houver saldo) e **gera as Contas a Receber**.
  - **Cancelar**: bloqueado se `NFE_GERADA` — **"Venda com nota fiscal gerada não pode ser cancelada"**.
- **Sem** exclusão física de Venda.

### Nota Fiscal de Saída (`/api/notas-fiscais-saida`)
- Espelho da Nota Fiscal de Entrada: só gerada por `Venda.gerarNfe()`, numeração `NFS-000001`, ..., mesmo endpoint de transporte sem validação de estado.

### Nota Fiscal de Serviço / NFS-e (`/api/notas-fiscais-servico`)
- **Único documento fiscal com endpoint de criação próprio**: `POST /gerar/{agendamentoId}`.
- Agendamento deve existir: **"Agendamento não encontrado"**.
- Agendamento precisa estar **CONCLUIDO**: **"NFS-e só pode ser gerada para agendamentos concluídos"**.
- Bloqueia duplicidade explicitamente — se já existe NFS-e para o agendamento: **"NFS-e já foi gerada para este agendamento"** (é a única nota fiscal com essa checagem de duplicidade explícita; as demais dependem só da máquina de estados de Compra/Venda).
- Copia cliente e valor total do Agendamento; numeração `NFSE-000001`, ...

---

## Resumo de padrões observados

- **Totais sempre recalculados no backend** (Nota de Entrada, Pedido de Compra, Venda, Agendamento) — nunca confia em valor vindo do formulário.
- **Máquinas de estado são `String` comparada com `.equals()`**, não `enum` Java — não há validação de que só um dos valores esperados seja persistido.
- **Duplicidade geralmente checada só na criação** (Produto, Cliente/CPF, Categoria é exceção e checa em ambos) — editar um registro para um valor já usado por outro nem sempre é bloqueado pela aplicação.
- **Nota de Entrada e Pedido de Compra não têm numeração automática**: são identificados pela chave composta (modelo, série, número, fornecedor) informada pelo usuário. Já as notas de saída e de serviço seguem numeração automática (`NFS-`, `NFSE-`).
- **Geração de Contas a Pagar/Receber e movimentação de Estoque é 100% automática**, disparada pela geração da NF-e — não existe caminho manual paralelo para isso além de criar uma Conta a Pagar/Receber avulsa (`POST /api/contas-pagar` / `/api/contas-receber`), que não passa pelo estoque.


---

## Atualização 06/10/2026 — Contas a Pagar na Nota de Entrada e novas validações

**Contas a Pagar dentro da Nota.** A resposta de `GET /api/notas-entrada/{modelo}/{serie}/{numero}/{fornecedorId}` traz a lista `contasPagar` (vazia enquanto a nota está PENDENTE; com uma conta por parcela depois de CONFERIDA). A tela da nota conferida mostra essa lista com situação, vencimento, valor pago e botões Pagar/Cancelar. Cada conta devolve `nota` (modelo/série/número) para a tela de Contas a Pagar mostrar a origem.

**Conta a Pagar (`/api/contas-pagar`)**
- `descricao` até 200 caracteres; `valor` maior que zero, até 10 inteiros e 2 decimais; vencimento entre 2000 e hoje + 10 anos (**"Data de vencimento inválida..."**); data de pagamento não pode ser futura nem anterior a 2000.
- Fornecedor precisa existir e estar ativo (**"Fornecedor inativo."**).
- Conta gerada por uma nota só pode ser **paga ou cancelada**: editar → **"Esta conta foi gerada pela Nota de Entrada ... e não pode ser editada"**; excluir → **"Contas geradas por uma Nota de Entrada não podem ser excluídas"** (ficam canceladas como histórico).

**Nota de Entrada (`/api/notas-entrada`)**
- Limites da chave: modelo até 2 dígitos, série até 3, número até 9; pedido (se informado) com valores positivos; no máximo 200 produtos.
- Data de emissão não pode ser anterior a 2000.
- Valor de frete maior que zero exige tipo de frete CIF/FOB: **"Informe o tipo de frete (CIF ou FOB) quando houver valor de frete."**
- Quantidade do item deve ser **inteira** (o saldo do estoque é inteiro; antes, 2,5 era arredondado e o estoque "perdia" produto): **"Produto X: a quantidade deve ser um número inteiro..."**
- Condição de pagamento inativa é recusada: **"Condição de pagamento inativa."**
- Valor do item ou da nota acima de R$ 9.999.999.999,99 → **"...é grande demais"** (antes estourava o banco).

**Fornecedor e Transportadora**
- Nome de 3 a 150 caracteres (espaços das pontas são cortados); endereço até 200, bairro até 100, inscrição estadual até 20 (letras, números, `.`, `-`, `/`), telefone até 15, CEP no formato `00000-000`; textos em branco viram nulo.
- CPF/CNPJ só com números e pontuação, validado pelo dígito verificador e **gravado formatado** (`000.000.000-00` / `00.000.000/0000-00`); duplicidade barrada mesmo se um vier com máscara e o outro sem: **"Já existe um fornecedor/uma transportadora cadastrada com este CPF/CNPJ."**
- Fornecedor com notas de entrada ou pedidos de compra não pode ser excluído (antes dava erro de chave estrangeira).

**Tipos no banco (ver `atualizacao_2026-10-06_contas_pagar_nota.sql`)**: `contas_pagar.valor` e derivados passaram de `DECIMAL(10,2)` para `DECIMAL(12,2)` (igual ao total da nota); `situacao` e a chave da nota ganharam `CHECK`; `cep` → `VARCHAR(9)`, `fone` → `VARCHAR(15)`, `inscricao_estadual` → `VARCHAR(20)`; índice para listar as contas de uma nota.
