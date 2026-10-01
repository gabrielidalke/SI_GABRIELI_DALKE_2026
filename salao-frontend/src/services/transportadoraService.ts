import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Transportadora {
  id: number;
  nome: string;
  cpfCnpj?: string;
  fone?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  ativo: boolean;
  cidadeId?: number | null;
  cidade?: { id: number; nome: string };
}

export interface TransportadoraRequest {
  nome: string;
  cpfCnpj?: string;
  fone?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  ativo: boolean;
  cidadeId?: number | null;
}

export const transportadoraService = {
  listar: () => axios.get<Transportadora[]>(`${API}/transportadoras`),
  buscar: (id: number) => axios.get<Transportadora>(`${API}/transportadoras/${id}`),
  criar: (dto: TransportadoraRequest) => axios.post<Transportadora>(`${API}/transportadoras`, dto),
  atualizar: (id: number, dto: TransportadoraRequest) => axios.put<Transportadora>(`${API}/transportadoras/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/transportadoras/${id}`),
};
