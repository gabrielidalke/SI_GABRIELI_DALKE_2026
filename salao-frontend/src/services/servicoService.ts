import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Servico {
  id?: number;
  nome: string;
  descricao: string;
  duracaoMin: number;
  preco: number;
  ativo: boolean;
}

export const servicoService = {
  listar: () => axios.get<Servico[]>(`${API}/servicos`),
  buscar: (id: number) => axios.get<Servico>(`${API}/servicos/${id}`),
  salvar: (data: Servico) => axios.post<Servico>(`${API}/servicos`, data),
  atualizar: (id: number, data: Servico) => axios.put<Servico>(`${API}/servicos/${id}`, data),
  deletar: (id: number) => axios.delete(`${API}/servicos/${id}`),
};