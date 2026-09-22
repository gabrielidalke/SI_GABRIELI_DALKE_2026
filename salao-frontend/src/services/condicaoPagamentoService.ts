import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface CondicaoPagamento {
  id: number;
  condicao: string;
  juro?: number;
  multa?: number;
  desconto?: number;
  ativo: boolean;
}

export interface ParcelaEmCondicao {
  id?: number;
  numeroParcela: number;
  diasVencimento: number;
  percentual: number;
  formaPagamentoId: number;
}

export interface CondicaoPagamentoRequest {
  condicao: string;
  juro?: number;
  multa?: number;
  desconto?: number;
  ativo: boolean;
  parcelas?: ParcelaEmCondicao[];
}

export const condicaoPagamentoService = {
  listar: () => axios.get<CondicaoPagamento[]>(`${API}/condicoes-pagamento`),
  buscarPorId: (id: number) => axios.get<CondicaoPagamento>(`${API}/condicoes-pagamento/${id}`),
  criar: (dto: CondicaoPagamentoRequest) => axios.post<CondicaoPagamento>(`${API}/condicoes-pagamento`, dto),
  atualizar: (id: number, dto: CondicaoPagamentoRequest) => axios.put<CondicaoPagamento>(`${API}/condicoes-pagamento/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/condicoes-pagamento/${id}`),
};
