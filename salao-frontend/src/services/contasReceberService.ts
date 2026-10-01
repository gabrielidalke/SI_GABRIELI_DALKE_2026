import axios from 'axios';
import type { CalculoBaixa } from './contasPagarService';

const API = 'http://localhost:8080/api';

export interface ContaReceber {
  id: number;
  descricao: string;
  cliente?: { id: number; nome: string };
  valor: number;
  dataVencimento: string;
  dataRecebimento?: string;
  situacao: 'ABERTA' | 'RECEBIDA' | 'CANCELADA';
  parcela?: { id: number; diasVencimento: number };
  ativo: boolean;
  percentualDesconto: number;
  percentualMulta: number;
  percentualJuro: number;
  valorComDesconto: number;
  valorDesconto: number;
  valorMulta: number;
  valorJuro: number;
  valorRecebido?: number;
}

export interface ContaReceberRequest {
  descricao: string;
  clienteId?: number | null;
  valor: number;
  dataVencimento: string;
  parcelaId?: number | null;
  ativo: boolean;
}

export const contasReceberService = {
  listar:        ()                                        => axios.get<ContaReceber[]>(`${API}/contas-receber`),
  buscarPorId:   (id: number)                              => axios.get<ContaReceber>(`${API}/contas-receber/${id}`),
  criar:         (data: ContaReceberRequest)               => axios.post<ContaReceber>(`${API}/contas-receber`, data),
  atualizar:     (id: number, data: ContaReceberRequest)   => axios.put<ContaReceber>(`${API}/contas-receber/${id}`, data),
  deletar:       (id: number)                              => axios.delete(`${API}/contas-receber/${id}`),
  calcularBaixa: (id: number, data: string)                => axios.get<CalculoBaixa>(`${API}/contas-receber/${id}/calculo-baixa`, { params: { data } }),
  receber:       (id: number, data: string)                => axios.post<ContaReceber>(`${API}/contas-receber/${id}/receber`, { data }),
  cancelar:      (id: number)                              => axios.post(`${API}/contas-receber/${id}/cancelar`),
};
