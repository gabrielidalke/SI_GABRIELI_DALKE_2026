// Regras compartilhadas pelo Pedido de Compra e pela Nota de Entrada (mesmo painel de produto, mesmos cálculos)

// Quantidade/preço/desconto ficam como texto enquanto editados: guardar já como number faz o React
// reescrever o valor a cada tecla (o "." do decimal some assim que é digitado).
export interface ItemLocal {
  _key: number;
  produtoId: number | '';
  classificacaoContaId: number | '';
  quantidade: string;
  valorUnitario: string;
  // O desconto pode ser digitado em % ou em R$: guarda-se o que foi digitado por último, e o outro é calculado
  descontoModo: 'PERCENTUAL' | 'VALOR';
  descontoInput: string;
  persistido: boolean; // já existia no documento salvo (a classificação da conta pode ficar travada)
}

export interface ItemCalculado {
  item: ItemLocal;
  bruto: number;
  descontoPercentual: number;
  descontoValor: number;
  liquido: number;
}

export const arred = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const fmt = (v: number) => `R$ ${(v || 0).toFixed(2)}`;

export const inteiroPositivo = (t: string) => /^\d+$/.test(t.trim()) && Number(t) > 0;

export const dataBR = (iso: string) => iso.split('-').reverse().join('/');

// Data local (toISOString é UTC: à noite no Brasil já seria "amanhã")
export const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

// O servidor guarda o percentual com 2 casas e recalcula o valor a partir dele: a prévia faz igual,
// para o que aparece na tela ser exatamente o que vai ser salvo.
export function calcularItem(item: ItemLocal): ItemCalculado {
  const bruto = arred((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0));
  const entrada = Number(item.descontoInput) || 0;
  const percentual = item.descontoModo === 'PERCENTUAL' ? entrada : (bruto > 0 ? entrada / bruto * 100 : 0);
  const descontoPercentual = arred(percentual);
  const descontoValor = arred(bruto * descontoPercentual / 100);
  return { item, bruto, descontoPercentual, descontoValor, liquido: arred(bruto - descontoValor) };
}

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
  if (c.descontoPercentual > 100) return 'Desconto deve estar entre 0 e 100% (o desconto em R$ não pode passar do valor bruto).';
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
