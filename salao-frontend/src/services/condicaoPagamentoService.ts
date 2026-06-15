import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface CondicaoPagamento {
  id: number;
  condicao: string;
  multa?: number;
  desconto?: number;
  ativo: boolean;
}

export interface CondicaoPagamentoRequest {
  condicao: string;
  multa?: number;
  desconto?: number;
  ativo: boolean;
}

export const condicaoPagamentoService = {
  listar: () => axios.get<CondicaoPagamento[]>(`${API}/condicoes-pagamento`),
  buscarPorId: (id: number) => axios.get<CondicaoPagamento>(`${API}/condicoes-pagamento/${id}`),
  criar: (dto: CondicaoPagamentoRequest) => axios.post<CondicaoPagamento>(`${API}/condicoes-pagamento`, dto),
  atualizar: (id: number, dto: CondicaoPagamentoRequest) => axios.put<CondicaoPagamento>(`${API}/condicoes-pagamento/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/condicoes-pagamento/${id}`),
};
