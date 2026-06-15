import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor?: { id: number; fornecedor: string };
  valor: number;
  dataVencimento: string;
  situacao: 'ABERTA' | 'PAGA' | 'CANCELADA';
  parcela?: { id: number; numeroDias: number };
  ativo: boolean;
}

export interface ContaPagarRequest {
  descricao: string;
  fornecedorId?: number | null;
  valor: number;
  dataVencimento: string;
  parcelaId?: number | null;
  ativo: boolean;
}

export const contasPagarService = {
  listar:      ()                                      => axios.get<ContaPagar[]>(`${API}/contas-pagar`),
  buscarPorId: (id: number)                            => axios.get<ContaPagar>(`${API}/contas-pagar/${id}`),
  criar:       (data: ContaPagarRequest)               => axios.post<ContaPagar>(`${API}/contas-pagar`, data),
  atualizar:   (id: number, data: ContaPagarRequest)   => axios.put<ContaPagar>(`${API}/contas-pagar/${id}`, data),
  deletar:     (id: number)                            => axios.delete(`${API}/contas-pagar/${id}`),
  pagar:       (id: number)                            => axios.post(`${API}/contas-pagar/${id}/pagar`),
  cancelar:    (id: number)                            => axios.post(`${API}/contas-pagar/${id}/cancelar`),
};
