import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface FormaPagamento {
  id: number;
  formaPagamento: string;
  percentual?: number;
  numeroDias?: number;
  ativo: boolean;
}

export interface FormaPagamentoRequest {
  formaPagamento: string;
  percentual?: number;
  numeroDias?: number;
  ativo: boolean;
}

export const formaPagamentoService = {
  listar: () => axios.get<FormaPagamento[]>(`${API}/formas-pagamento`),
  buscarPorId: (id: number) => axios.get<FormaPagamento>(`${API}/formas-pagamento/${id}`),
  criar: (dto: FormaPagamentoRequest) => axios.post<FormaPagamento>(`${API}/formas-pagamento`, dto),
  atualizar: (id: number, dto: FormaPagamentoRequest) => axios.put<FormaPagamento>(`${API}/formas-pagamento/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/formas-pagamento/${id}`),
};
