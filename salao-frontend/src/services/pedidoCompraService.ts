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
  classificacaoContaId?: number | null; // pedidos antigos (antes de 02/10) não têm
  classificacaoNome?: string | null;
  quantidade: number;
  valorUnitario: number;
  valorBruto: number;
  descontoPercentual: number;
  descontoValor: number;
  valorLiquido: number;
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
  condicaoPagamento?: { id: number; condicao: string } | null;
  valorProdutos: number; // bruto
  valorDesconto: number;
  valorLiquido: number;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  valorTotal: number;
  itens: PedidoCompraItem[];
}

export interface PedidoCompraRequest extends PedidoCompraChave {
  dataPedido: string;
  observacoes?: string;
  condicaoPagamentoId?: number | null;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  itens: {
    produtoId: number;
    classificacaoContaId: number;
    quantidade: number;
    valorUnitario: number;
    descontoPercentual: number;
  }[];
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
