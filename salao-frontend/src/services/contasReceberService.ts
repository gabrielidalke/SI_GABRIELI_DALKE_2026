import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface ContaReceber {
  id: number;
  descricao: string;
  cliente?: { id: number; nome: string };
  valor: number;
  dataVencimento: string;
  situacao: 'ABERTA' | 'RECEBIDA' | 'CANCELADA';
  parcela?: { id: number; numeroDias: number };
  ativo: boolean;
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
  listar:      ()                                        => axios.get<ContaReceber[]>(`${API}/contas-receber`),
  buscarPorId: (id: number)                              => axios.get<ContaReceber>(`${API}/contas-receber/${id}`),
  criar:       (data: ContaReceberRequest)               => axios.post<ContaReceber>(`${API}/contas-receber`, data),
  atualizar:   (id: number, data: ContaReceberRequest)   => axios.put<ContaReceber>(`${API}/contas-receber/${id}`, data),
  deletar:     (id: number)                              => axios.delete(`${API}/contas-receber/${id}`),
  receber:     (id: number)                              => axios.post(`${API}/contas-receber/${id}/receber`),
  cancelar:    (id: number)                              => axios.post(`${API}/contas-receber/${id}/cancelar`),
};
