import axios from 'axios';

const API = 'http://localhost:8080/api';

import type { TipoPessoa } from './tipoPessoa';

export interface Cliente {
  id?: number;
  tipoPessoa?: TipoPessoa;
  nome: string;
  apelido?: string;
  contato?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  limiteCredito?: number;
  dataNascimento?: string;
  sexo?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  observacao?: string;
  ativo: boolean;
  cidadeId?: number;
  condicaoPagamentoId?: number;
  condicaoPagamento?: { id: number; condicao: string };
  cidade?: {
    id: number;
    nome: string;
    estado: { id: number; nome: string; uf: string };
  };
}

export const clienteService = {
  listar: () => axios.get<Cliente[]>(`${API}/clientes`),
  buscar: (id: number) => axios.get<Cliente>(`${API}/clientes/${id}`),
  salvar: (data: Cliente) => axios.post<Cliente>(`${API}/clientes`, data),
  atualizar: (id: number, data: Cliente) => axios.put<Cliente>(`${API}/clientes/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/clientes/${id}`),
};