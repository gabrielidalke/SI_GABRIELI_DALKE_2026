import axios from 'axios';

const API = 'http://localhost:8080/api';

// Resultado de GET .../calculo-baixa — calculado só no backend (CalculoBaixa.java)
export interface CalculoBaixa {
  dataBaixa: string;
  dataVencimento: string;
  diasAtraso: number;
  valor: number;
  percentualDesconto: number;
  valorDesconto: number;
  percentualMulta: number;
  valorMulta: number;
  percentualJuro: number;
  valorJuro: number;
  valorFinal: number;
}

export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor?: { id: number; fornecedor: string };
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  situacao: 'ABERTA' | 'PAGA' | 'CANCELADA';
  parcela?: { id: number; diasVencimento: number };
  ativo: boolean;
  percentualDesconto: number;
  percentualMulta: number;
  percentualJuro: number;
  valorComDesconto: number;
  valorDesconto: number;
  valorMulta: number;
  valorJuro: number;
  valorPago?: number;
  // Nota de Entrada que gerou a conta (null quando foi lançada manualmente)
  nota?: { modelo: number; serie: number; numero: number } | null;
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
  listar:        ()                                      => axios.get<ContaPagar[]>(`${API}/contas-pagar`),
  buscarPorId:   (id: number)                            => axios.get<ContaPagar>(`${API}/contas-pagar/${id}`),
  criar:         (data: ContaPagarRequest)               => axios.post<ContaPagar>(`${API}/contas-pagar`, data),
  atualizar:     (id: number, data: ContaPagarRequest)   => axios.put<ContaPagar>(`${API}/contas-pagar/${id}`, data),
  deletar:       (id: number)                            => axios.delete(`${API}/contas-pagar/${id}`),
  calcularBaixa: (id: number, data: string)              => axios.get<CalculoBaixa>(`${API}/contas-pagar/${id}/calculo-baixa`, { params: { data } }),
  pagar:         (id: number, data: string)              => axios.post<ContaPagar>(`${API}/contas-pagar/${id}/pagar`, { data }),
  cancelar:      (id: number)                            => axios.post(`${API}/contas-pagar/${id}/cancelar`),
};
