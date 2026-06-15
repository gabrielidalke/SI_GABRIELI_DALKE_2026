import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface CompraItem {
  id?: number;
  produtoId?: number;
  produto?: { id: number; nome: string; preco: number };
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface Compra {
  id: number;
  numeroCompra: string;
  dataCompra: string;
  fornecedor?: { id: number; fornecedor: string };
  observacao?: string;
  valorTotal: number;
  status: 'RASCUNHO' | 'VALIDADA' | 'NFE_GERADA' | 'CANCELADA';
  itens: CompraItem[];
}

export interface CompraRequest {
  numeroCompra: string;
  dataCompra: string;
  fornecedorId?: number | null;
  observacao?: string;
  itens: { produtoId: number; quantidade: number; precoUnitario: number }[];
}

export const compraService = {
  listar:      ()                                  => axios.get<Compra[]>(`${API}/compras`),
  buscarPorId: (id: number)                        => axios.get<Compra>(`${API}/compras/${id}`),
  criar:       (data: CompraRequest)               => axios.post<Compra>(`${API}/compras`, data),
  atualizar:   (id: number, data: CompraRequest)   => axios.put<Compra>(`${API}/compras/${id}`, data),
  validar:     (id: number)                        => axios.post(`${API}/compras/${id}/validar`),
  cancelar:    (id: number)                        => axios.post(`${API}/compras/${id}/cancelar`),
  gerarNfe:    (id: number)                        => axios.post(`${API}/compras/${id}/gerar-nfe`),
};
