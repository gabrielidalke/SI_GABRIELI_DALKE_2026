import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Pais {
  id: number;
  nome: string;
  sigla: string;
  nacionalidade?: string;
  moeda?: string;
  ativo: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface PaisRequest {
  nome: string;
  sigla: string;
  nacionalidade?: string;
  moeda?: string;
  ativo: boolean;
}

export const paisService = {
  listar: () => axios.get<Pais[]>(`${API}/paises`),
  buscar: (id: number) => axios.get<Pais>(`${API}/paises/${id}`),
  salvar: (dto: PaisRequest) => axios.post<Pais>(`${API}/paises`, dto),
  atualizar: (id: number, dto: PaisRequest) => axios.put<Pais>(`${API}/paises/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/paises/${id}`),
};
