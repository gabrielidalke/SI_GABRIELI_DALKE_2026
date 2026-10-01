import axios from 'axios';

const API = 'http://localhost:8080/api';

export type SituacaoNota = 'PENDENTE' | 'CONFERIDA';

// A Nota de Entrada NÃO tem ID: ela é identificada por Modelo + Série + Número + Fornecedor
export interface NotaEntradaChave {
  modelo: number;
  serie: number;
  numero: number;
  fornecedorId: number;
}

export interface PedidoRef {
  modelo: number;
  serie: number;
  numero: number;
}

export interface NotaEntradaResumo extends NotaEntradaChave {
  fornecedorNome?: string;
  dataEmissao: string;
  dataChegada?: string | null;
  valorTotal: number;
  situacao: SituacaoNota;
  pedido?: PedidoRef | null;
}

export interface NotaEntradaItem {
  produtoId: number;
  produtoNome?: string;
  unidade?: string;
  classificacaoContaId: number;
  classificacaoNome?: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  descontoPercentual: number;
  descontoValor: number;
  rateioFrete: number;
  rateioSeguro: number;
  rateioOutras: number;
  custoFinal: number;
}

export interface NotaEntrada {
  modelo: number;
  serie: number;
  numero: number;
  fornecedor: { id: number; nome?: string; ativo?: boolean };
  dataEmissao: string;
  dataChegada?: string | null;
  tipoFrete?: 'CIF' | 'FOB' | null;
  valorProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  valorDesconto: number;
  valorTotal: number;
  condicaoPagamento?: { id: number; condicao: string } | null;
  transportadora?: { id: number; nome: string; ativo?: boolean } | null;
  placaVeiculo?: string | null;
  observacoes?: string | null;
  situacao: SituacaoNota;
  pedido?: PedidoRef | null;
  itens: NotaEntradaItem[];
}

export interface NotaEntradaItemRequest {
  produtoId: number;
  classificacaoContaId: number;
  quantidade: number;
  valorUnitario: number;
  descontoPercentual: number;
}

export interface NotaEntradaRequest extends NotaEntradaChave {
  dataEmissao: string;
  dataChegada?: string;
  tipoFrete?: 'CIF' | 'FOB';
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  condicaoPagamentoId?: number | null;
  transportadoraId?: number | null;
  placaVeiculo?: string;
  observacoes?: string;
  pedidoNumero?: number | null;
  pedidoSerie?: number | null;
  pedidoModelo?: number | null;
  itens: NotaEntradaItemRequest[];
}

const caminho = (c: NotaEntradaChave) =>
  `${API}/notas-entrada/${c.modelo}/${c.serie}/${c.numero}/${c.fornecedorId}`;

// Rota da tela de edição/visualização: a chave inteira vai na URL (não existe ID)
export const caminhoTelaNota = (c: NotaEntradaChave) =>
  `/notas-entrada/${c.modelo}/${c.serie}/${c.numero}/${c.fornecedorId}`;

export const notaEntradaService = {
  listar:    () => axios.get<NotaEntradaResumo[]>(`${API}/notas-entrada`),
  existe:    (c: NotaEntradaChave) => axios.get<{ existe: boolean }>(`${API}/notas-entrada/existe`, { params: c }),
  buscar:    (c: NotaEntradaChave) => axios.get<NotaEntrada>(caminho(c)),
  criar:     (dto: NotaEntradaRequest) => axios.post<NotaEntrada>(`${API}/notas-entrada`, dto),
  atualizar: (c: NotaEntradaChave, dto: NotaEntradaRequest) => axios.put<NotaEntrada>(caminho(c), dto),
  confirmar: (c: NotaEntradaChave) => axios.post<NotaEntrada>(`${caminho(c)}/confirmar`),
  excluir:   (c: NotaEntradaChave) => axios.delete(caminho(c)),
};

// Mensagem de erro vinda do backend ({ mensagem }) ou um texto padrão
export function mensagemDeErro(e: unknown, padrao: string): string {
  if (axios.isAxiosError<{ mensagem?: string; message?: string }>(e))
    return e.response?.data?.mensagem || e.response?.data?.message || padrao;
  return padrao;
}
