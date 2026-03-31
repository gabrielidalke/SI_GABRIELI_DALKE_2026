import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Categoria {
  id?: number;
  nome: string;
  ativo: boolean;
}

export const categoriaService = {
  listar: () => axios.get<Categoria[]>(`${API}/categorias`),
  buscar: (id: number) => axios.get<Categoria>(`${API}/categorias/${id}`),
  salvar: (data: Categoria) => axios.post<Categoria>(`${API}/categorias`, data),
  atualizar: (id: number, data: Categoria) => axios.put<Categoria>(`${API}/categorias/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/categorias/${id}`),
};