import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Cidade {
  id: number;
  nome: string;
  estadoId?: number;
  estadoNome?: string;
  estadoUf?: string;
  ativo: boolean;
}

export interface CidadeRequest {
  nome: string;
  estadoId?: number;
  ativo: boolean;
}

export const cidadeService = {
  listar: () => axios.get<Cidade[]>(`${API}/cidades`),
  buscar: (id: number) => axios.get<Cidade>(`${API}/cidades/${id}`),
  listarPorEstado: (estadoId: number) => axios.get<Cidade[]>(`${API}/cidades/por-estado/${estadoId}`),
  salvar: (dto: CidadeRequest) => axios.post<Cidade>(`${API}/cidades`, dto),
  atualizar: (id: number, dto: CidadeRequest) => axios.put<Cidade>(`${API}/cidades/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/cidades/${id}`),
};
