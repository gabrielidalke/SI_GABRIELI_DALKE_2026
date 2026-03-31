import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  ativo: boolean;
}

export const produtoService = {
  listar: () => axios.get<Produto[]>(`${API}/produtos`),
  buscar: (id: number) => axios.get<Produto>(`${API}/produtos/${id}`),
  salvar: (data: Produto) => axios.post<Produto>(`${API}/produtos`, data),
  atualizar: (id: number, data: Produto) => axios.put<Produto>(`${API}/produtos/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/produtos/${id}`),
};