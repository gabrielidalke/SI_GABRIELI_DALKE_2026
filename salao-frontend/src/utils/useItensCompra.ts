import { useRef, useState } from 'react';
import type { Produto } from '../services/produtoService';
import { calcularItem, itemVazio, validarItem, type ItemLocal } from './itensCompra';

export type ItemSemChave = Omit<ItemLocal, '_key'>;

// Estado da lista de produtos + painel "Adicionar Produto" (mesmo comportamento no Pedido e na Nota)
export function useItensCompra(produtos: Produto[]) {
  const keyRef = useRef(0);
  const nextKey = () => ++keyRef.current;

  const [itens, setItens] = useState<ItemLocal[]>([]);
  const [novoItem, setNovoItem] = useState<ItemLocal>(() => itemVazio(0));
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [erroItem, setErroItem] = useState('');

  const produtoDe = (id: number | '') => produtos.find(p => p.id === id);

  const limparPainel = () => { setNovoItem(itemVazio(nextKey())); setEditingKey(null); setErroItem(''); };

  // substitui a lista inteira (ao abrir um documento salvo ou ao puxar os itens de um pedido)
  const carregar = (lista: ItemSemChave[]) => {
    setItens(lista.map(i => ({ ...i, _key: nextKey() })));
    limparPainel();
  };

  const mudarNovoItem = (changes: Partial<ItemLocal>) => { setNovoItem(prev => ({ ...prev, ...changes })); setErroItem(''); };

  const selecionarProduto = (produtoId: number | '', classificacaoSugerida?: number) => {
    const produto = produtoDe(produtoId);
    setErroItem('');
    setNovoItem(prev => {
      // o valor sugerido (preço de custo) acompanha o produto; um valor digitado pela pessoa é respeitado
      const anterior = produtoDe(prev.produtoId);
      const sugerido = prev.valorUnitario === '' || (anterior != null && String(anterior.precoCusto ?? 0) === prev.valorUnitario);
      return {
        ...prev,
        produtoId,
        valorUnitario: sugerido && produto ? String(produto.precoCusto ?? 0) : prev.valorUnitario,
        classificacaoContaId: classificacaoSugerida ?? prev.classificacaoContaId,
      };
    });
  };

  const adicionarOuAtualizar = () => {
    const problema = validarItem(novoItem, calcularItem(novoItem));
    if (problema) { setErroItem(problema); return; }
    if (itens.some(i => i.produtoId === novoItem.produtoId && i._key !== editingKey)) {
      setErroItem('Este produto já está na lista. Edite a linha existente em vez de repetir o produto.');
      return;
    }
    if (editingKey != null) {
      setItens(prev => prev.map(i => i._key === editingKey ? { ...novoItem, _key: editingKey, persistido: i.persistido } : i));
    } else {
      setItens(prev => [...prev, { ...novoItem, _key: nextKey(), persistido: false }]);
    }
    limparPainel();
  };

  const editar = (item: ItemLocal) => { setNovoItem(item); setEditingKey(item._key); setErroItem(''); };

  const remover = (key: number) => {
    setItens(prev => prev.filter(i => i._key !== key));
    if (editingKey === key) limparPainel();
  };

  const trocarClassificacao = (key: number, id: number | '') =>
    setItens(prev => prev.map(i => i._key === key ? { ...i, classificacaoContaId: id } : i));

  return {
    itens, novoItem, editingKey, erroItem, produtoDe,
    carregar, mudarNovoItem, selecionarProduto, adicionarOuAtualizar, editar, remover, trocarClassificacao,
    cancelarEdicao: limparPainel,
  };
}
