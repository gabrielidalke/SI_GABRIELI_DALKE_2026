import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface NotaFiscalSaida {
  id: number;
  numeroNota: string;
  serie?: string;
  dataEmissao: string;
  cliente?: { id: number; nome: string };
  valorTotal: number;
  transportadoraNome?: string;
  veiculoPlaca?: string;
  vendaId?: number;
}

export interface TransporteRequest {
  transportadoraNome?: string;
  veiculoPlaca?: string;
}

export const notaFiscalSaidaService = {
  listar:              ()                                     => axios.get<NotaFiscalSaida[]>(`${API}/notas-fiscais-saida`),
  buscarPorId:         (id: number)                          => axios.get<NotaFiscalSaida>(`${API}/notas-fiscais-saida/${id}`),
  atualizarTransporte: (id: number, data: TransporteRequest) => axios.put(`${API}/notas-fiscais-saida/${id}/transporte`, data),
};
