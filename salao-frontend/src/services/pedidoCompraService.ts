import axios from 'axios';

const API = 'http://localhost:8080/api';

export type SituacaoPedido = 'ABERTA' | 'PARCIAL' | 'CONCLUIDA';

// Assim como a nota, o Pedido de Compra é identificado por Modelo + Série + Número + Fornecedor
export interface PedidoCompraChave {
  modelo: number;
  serie: number;
  numero: number;
  fornecedorId: number;
}

export interface PedidoCompraItem {
  produtoId: number;
  produtoNome?: string;
  unidade?: string;
  quantidade: number;
  valorUnitario: number;
  quantidadeRecebida: number;
}

export interface PedidoCompra {
  modelo: number;
  serie: number;
  numero: number;
  fornecedor: { id: number; nome?: string; ativo?: boolean };
  dataPedido: string;
  observacoes?: string | null;
  situacao: SituacaoPedido;
  valorTotal: number;
  itens: PedidoCompraItem[];
}

export interface PedidoCompraRequest extends PedidoCompraChave {
  dataPedido: string;
  observacoes?: string;
  itens: { produtoId: number; quantidade: number; valorUnitario: number }[];
}

const caminho = (c: PedidoCompraChave) =>
  `${API}/pedidos-compra/${c.modelo}/${c.serie}/${c.numero}/${c.fornecedorId}`;

export const pedidoCompraService = {
  listar: (filtro?: { situacoes?: SituacaoPedido[]; fornecedorId?: number | null }) =>
    axios.get<PedidoCompra[]>(`${API}/pedidos-compra`, {
      params: {
        situacoes: filtro?.situacoes?.join(','),
        fornecedorId: filtro?.fornecedorId ?? undefined,
      },
    }),
  existe:    (c: PedidoCompraChave) => axios.get<{ existe: boolean }>(`${API}/pedidos-compra/existe`, { params: c }),
  buscar:    (c: PedidoCompraChave) => axios.get<PedidoCompra>(caminho(c)),
  criar:     (dto: PedidoCompraRequest) => axios.post<PedidoCompra>(`${API}/pedidos-compra`, dto),
  atualizar: (c: PedidoCompraChave, dto: PedidoCompraRequest) => axios.put<PedidoCompra>(caminho(c), dto),
  excluir:   (c: PedidoCompraChave) => axios.delete(caminho(c)),
};
