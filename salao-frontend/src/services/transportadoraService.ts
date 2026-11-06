import axios from 'axios';

const API = 'http://localhost:8080/api';

import type { TipoPessoa } from './tipoPessoa';

export interface Transportadora {
  id: number;
  tipoPessoa?: TipoPessoa;
  nome: string;
  nomeFantasia?: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  inscEstSubstTrib?: string;
  fone?: string;
  email?: string;
  site?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  ativo: boolean;
  cidadeId?: number | null;
  cidade?: { id: number; nome: string };
}

export interface TransportadoraRequest {
  tipoPessoa: TipoPessoa;
  nome: string;
  nomeFantasia?: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  inscEstSubstTrib?: string;
  fone?: string;
  email?: string;
  site?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
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
