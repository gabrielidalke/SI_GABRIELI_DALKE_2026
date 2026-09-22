import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Parcela {
  id: number;
  diasVencimento: number;
  percentual: number;
  formaPagamento: { id: number; formaPagamento: string };
  condicaoPagamento: { id: number; condicao: string };
  ativo: boolean;
}

export interface ParcelaRequest {
  diasVencimento: number;
  percentual: number;
  formaPagamentoId: number;
  condicaoPagamentoId: number;
  ativo: boolean;
}

export const parcelaService = {
  listar: () => axios.get<Parcela[]>(`${API}/parcelas`),
  buscarPorId: (id: number) => axios.get<Parcela>(`${API}/parcelas/${id}`),
  criar: (dto: ParcelaRequest) => axios.post<Parcela>(`${API}/parcelas`, dto),
  atualizar: (id: number, dto: ParcelaRequest) => axios.put<Parcela>(`${API}/parcelas/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/parcelas/${id}`),
};
