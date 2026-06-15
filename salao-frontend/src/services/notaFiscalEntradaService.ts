import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface NotaFiscalEntrada {
  id: number;
  numeroNota: string;
  serie?: string;
  dataEmissao: string;
  fornecedor?: { id: number; fornecedor: string };
  valorTotal: number;
  transportadoraNome?: string;
  veiculoPlaca?: string;
  compraId?: number;
}

export interface TransporteRequest {
  transportadoraNome?: string;
  veiculoPlaca?: string;
}

export const notaFiscalEntradaService = {
  listar:              ()                                      => axios.get<NotaFiscalEntrada[]>(`${API}/notas-fiscais-entrada`),
  buscarPorId:         (id: number)                           => axios.get<NotaFiscalEntrada>(`${API}/notas-fiscais-entrada/${id}`),
  atualizarTransporte: (id: number, data: TransporteRequest)  => axios.put(`${API}/notas-fiscais-entrada/${id}/transporte`, data),
};
