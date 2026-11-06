// Regras compartilhadas pelo Pedido de Compra e pela Nota de Entrada (mesmo painel de produto, mesmos cálculos)

// Quantidade/preço/desconto ficam como texto enquanto editados: guardar já como number faz o React
// reescrever o valor a cada tecla (o "." do decimal some assim que é digitado).
export interface ItemLocal {
  _key: number;
  produtoId: number | '';
  classificacaoContaId: number | '';
  quantidade: string;
  valorUnitario: string;
  // O desconto pode ser digitado em % ou em R$ POR UNIDADE: guarda-se o que foi digitado por último, e o outro é calculado
  descontoModo: 'PERCENTUAL' | 'VALOR';
  descontoInput: string;
  persistido: boolean; // já existia no documento salvo (a classificação da conta pode ficar travada)
}

export interface ItemCalculado {
  item: ItemLocal;
  bruto: number;                 // quantidade x valor unitário
  descontoPercentual: number;
  descontoUnitario: number;      // R$ por unidade
  valorUnitarioLiquido: number;  // valor unitário - desconto unitário
  descontoValor: number;         // desconto do item = quantidade x desconto unitário
  liquido: number;               // quantidade x valor unitário líquido
}

export const arred = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const fmt = (v: number) => `R$ ${(v || 0).toFixed(2)}`;

export const inteiroPositivo = (t: string) => /^\d+$/.test(t.trim()) && Number(t) > 0;

export const dataBR = (iso?: string | null) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');

// Data local (toISOString é UTC: à noite no Brasil já seria "amanhã")
export const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// Regra: o desconto sai do VALOR UNITÁRIO (não do total do item). Mesmo cálculo do servidor (DescontoItem),
// para o que aparece na tela ser exatamente o que vai ser salvo:
//   em %:  desconto unitário = valor unitário x % (2 casas)
//   em R$: o valor digitado já é o desconto de cada unidade (e o % é calculado)
export function calcularItem(item: ItemLocal): ItemCalculado {
  const quantidade = Number(item.quantidade) || 0;
  const valorUnitario = Number(item.valorUnitario) || 0;
  const bruto = arred(quantidade * valorUnitario);
  const entrada = Number(item.descontoInput) || 0;
  let descontoUnitario: number;
  let descontoPercentual: number;
  if (item.descontoModo === 'VALOR') {
    descontoUnitario = arred(entrada);
    descontoPercentual = valorUnitario > 0 ? arred(descontoUnitario / valorUnitario * 100) : 0;
  } else {
    descontoPercentual = arred(entrada);
    descontoUnitario = arred(valorUnitario * descontoPercentual / 100);
  }
  const descontoValor = arred(descontoUnitario * quantidade);
  return {
    item, bruto, descontoPercentual, descontoUnitario,
    valorUnitarioLiquido: arred(valorUnitario - descontoUnitario),
    descontoValor, liquido: arred(bruto - descontoValor),
  };
}

// Item salvo volta para a tela com o desconto em R$ por unidade (é o valor exato gravado);
// sem esse campo (servidor antigo), usa o percentual
export const descontoSalvo = (descontoUnitario?: number | null, descontoPercentual?: number | null): Pick<ItemLocal, 'descontoModo' | 'descontoInput'> =>
  descontoUnitario != null
    ? { descontoModo: 'VALOR', descontoInput: descontoUnitario ? String(descontoUnitario) : '' }
    : { descontoModo: 'PERCENTUAL', descontoInput: descontoPercentual ? String(descontoPercentual) : '' };

export const itemVazio = (key: number): ItemLocal => ({
  _key: key, produtoId: '', classificacaoContaId: '', quantidade: '1', valorUnitario: '',
  descontoModo: 'PERCENTUAL', descontoInput: '', persistido: false,
});

// Mensagem do primeiro problema do item (ou '' se estiver ok), usada ao clicar em "Adicionar Produto"
export function validarItem(item: ItemLocal, c: ItemCalculado): string {
  if (!item.produtoId) return 'Selecione o produto.';
  if (!item.classificacaoContaId) return 'Selecione a classificação da conta.';
  if (!item.quantidade || Number(item.quantidade) <= 0) return 'Quantidade deve ser maior que zero.';
  if (item.valorUnitario === '' || Number(item.valorUnitario) < 0) return 'Valor unitário é obrigatório e não pode ser negativo.';
  if (Number(item.descontoInput) < 0) return 'Desconto não pode ser negativo.';
  if (c.descontoPercentual > 100 || c.descontoUnitario > (Number(item.valorUnitario) || 0))
    return 'O desconto não pode ser maior que o valor unitário (máximo 100%).';
  return '';
}

export interface Despesas {
  valorFrete: string;
  valorSeguro: string;
  outrasDespesas: string;
}

export const despesasVazias: Despesas = { valorFrete: '', valorSeguro: '', outrasDespesas: '' };

export const valorDe = (t: string) => Number(t) || 0;

// Total geral = produtos líquido + frete + seguro + outras despesas
export const totalGeral = (itens: ItemLocal[], d: Despesas) =>
  arred(somar(itens.map(calcularItem)).liquido + valorDe(d.valorFrete) + valorDe(d.valorSeguro) + valorDe(d.outrasDespesas));

export const somar = (itens: ItemCalculado[]) => {
  const bruto = arred(itens.reduce((s, c) => s + c.bruto, 0));
  const desconto = arred(itens.reduce((s, c) => s + c.descontoValor, 0));
  return {
    quantidade: Number(itens.reduce((s, c) => s + (Number(c.item.quantidade) || 0), 0).toFixed(3)),
    bruto, desconto, liquido: arred(bruto - desconto),
  };
};
