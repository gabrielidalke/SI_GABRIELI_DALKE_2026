import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface MovimentacaoEstoque {
  id: number;
  produto?: { id: number; nome: string };
  tipo: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  saldoAnterior?: number | null;
  saldoResultante: number;
  custoUnitario?: number | null;
  origemTipo?: string;
  origemId?: number;
  documento?: string | null;
  criadoEm: string;
}

export const estoqueService = {
  listar: () => axios.get<MovimentacaoEstoque[]>(`${API}/estoque`),
  listarPorProduto: (produtoId: number) => axios.get<MovimentacaoEstoque[]>(`${API}/estoque/produto/${produtoId}`),
};
