import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface ClassificacaoConta {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface ClassificacaoContaRequest {
  nome: string;
  ativo: boolean;
}

export const classificacaoContaService = {
  listar: () => axios.get<ClassificacaoConta[]>(`${API}/classificacoes-conta`),
  buscarPorId: (id: number) => axios.get<ClassificacaoConta>(`${API}/classificacoes-conta/${id}`),
  criar: (dto: ClassificacaoContaRequest) => axios.post<ClassificacaoConta>(`${API}/classificacoes-conta`, dto),
  atualizar: (id: number, dto: ClassificacaoContaRequest) => axios.put<ClassificacaoConta>(`${API}/classificacoes-conta/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/classificacoes-conta/${id}`),
};
