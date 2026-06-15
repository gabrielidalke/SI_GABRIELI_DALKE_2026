import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface VendaItem {
  id?: number;
  produtoId?: number;
  produto?: { id: number; nome: string; preco: number };
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface Venda {
  id: number;
  numeroVenda: string;
  dataVenda: string;
  cliente?: { id: number; nome: string };
  observacao?: string;
  valorTotal: number;
  status: 'RASCUNHO' | 'VALIDADA' | 'NFE_GERADA' | 'CANCELADA';
  itens: VendaItem[];
}

export interface VendaRequest {
  numeroVenda: string;
  dataVenda: string;
  clienteId?: number | null;
  observacao?: string;
  itens: { produtoId: number; quantidade: number; precoUnitario: number }[];
}

export const vendaService = {
  listar:      ()                                => axios.get<Venda[]>(`${API}/vendas`),
  buscarPorId: (id: number)                      => axios.get<Venda>(`${API}/vendas/${id}`),
  criar:       (data: VendaRequest)              => axios.post<Venda>(`${API}/vendas`, data),
  atualizar:   (id: number, data: VendaRequest)  => axios.put<Venda>(`${API}/vendas/${id}`, data),
  validar:     (id: number)                      => axios.post(`${API}/vendas/${id}/validar`),
  cancelar:    (id: number)                      => axios.post(`${API}/vendas/${id}/cancelar`),
  gerarNfe:    (id: number)                      => axios.post(`${API}/vendas/${id}/gerar-nfe`),
};
