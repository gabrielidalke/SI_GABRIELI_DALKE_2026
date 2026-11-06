import axios from 'axios';

const API = 'http://localhost:8080/api';

import type { TipoPessoa } from './tipoPessoa';

export interface Funcionario {
  id?: number;
  tipoPessoa?: TipoPessoa;
  nome: string;
  apelido?: string;
  email: string;
  telefone: string;
  cpfCnpj?: string;
  rg?: string;
  inscricaoEstadual?: string;
  funcaoId?: number;
  funcao?: { id: number; funcao: string; salarioBase: number };
  cidadeId?: number;
  cidade?: { id: number; nome: string };
  dataNascimento?: string;
  dataAdmissao: string;
  dataDemissao?: string;
  sexo?: string;
  estadoCivil?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  salario?: number;
  percentualComissao?: number;
  observacao?: string;
  ativo: boolean;
}

export const funcionarioService = {
  listar: () => axios.get<Funcionario[]>(`${API}/funcionarios`),
  buscar: (id: number) => axios.get<Funcionario>(`${API}/funcionarios/${id}`),
  salvar: (data: Funcionario) => axios.post<Funcionario>(`${API}/funcionarios`, data),
  atualizar: (id: number, data: Funcionario) => axios.put<Funcionario>(`${API}/funcionarios/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/funcionarios/${id}`),
};