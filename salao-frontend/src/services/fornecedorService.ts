import axios from 'axios';

const API = 'http://localhost:8080/api';

import type { TipoPessoa } from './tipoPessoa';

export interface Fornecedor {
  id: number;
  tipoPessoa?: TipoPessoa;
  fornecedor: string;
  nomeFantasia?: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  inscEstSubstTrib?: string;
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  fone?: string;
  celular?: string;
  email?: string;
  contato?: string;
  site?: string;
  observacao?: string;
  ativo: boolean;
  cidadeId?: number | null;
  condicaoPagamentoId?: number | null;
  cidade?: { id: number; nome: string; estadoUf?: string };
  condicaoPagamento?: { id: number; condicao: string };
}

export interface FornecedorRequest {
  tipoPessoa: TipoPessoa;
  fornecedor: string;
  nomeFantasia?: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  inscEstSubstTrib?: string;
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  fone?: string;
  celular?: string;
  email?: string;
  contato?: string;
  site?: string;
  observacao?: string;
  ativo: boolean;
  cidadeId?: number | null;
  condicaoPagamentoId?: number | null;
}

export const fornecedorService = {
  listar: () => axios.get<Fornecedor[]>(`${API}/fornecedores`),
  buscar: (id: number) => axios.get<Fornecedor>(`${API}/fornecedores/${id}`),
  criar: (dto: FornecedorRequest) => axios.post<Fornecedor>(`${API}/fornecedores`, dto),
  atualizar: (id: number, dto: FornecedorRequest) => axios.put<Fornecedor>(`${API}/fornecedores/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/fornecedores/${id}`),
};
