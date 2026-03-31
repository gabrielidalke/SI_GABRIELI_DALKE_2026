import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Cliente {
  id?: number;
  nome: string;
  apelido?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  sexo?: string;
  estadoCivil?: string;
  observacao?: string;
  ativo: boolean;
}

export const clienteService = {
  listar: () => axios.get<Cliente[]>(`${API}/clientes`),
  buscar: (id: number) => axios.get<Cliente>(`${API}/clientes/${id}`),
  salvar: (data: Cliente) => axios.post<Cliente>(`${API}/clientes`, data),
  atualizar: (id: number, data: Cliente) => axios.put<Cliente>(`${API}/clientes/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/clientes/${id}`),
};