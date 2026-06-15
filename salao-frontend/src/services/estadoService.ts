import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Estado {
  id: number;
  nome: string;
  uf: string;
  paisId?: number;
  paisNome?: string;
  ativo: boolean;
}

export interface EstadoRequest {
  nome: string;
  uf: string;
  paisId?: number;
  ativo: boolean;
}

export const estadoService = {
  listar: () => axios.get<Estado[]>(`${API}/estados`),
  buscar: (id: number) => axios.get<Estado>(`${API}/estados/${id}`),
  listarPorPais: (paisId: number) => axios.get<Estado[]>(`${API}/estados/por-pais/${paisId}`),
  salvar: (dto: EstadoRequest) => axios.post<Estado>(`${API}/estados`, dto),
  atualizar: (id: number, dto: EstadoRequest) => axios.put<Estado>(`${API}/estados/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/estados/${id}`),
};
