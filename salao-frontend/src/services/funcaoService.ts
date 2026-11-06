import axios from 'axios';

const API = 'http://localhost:8080/api';

// Função/cargo do funcionário com o salário base
export interface Funcao {
  id: number;
  funcao: string;
  salarioBase: number;
  ativo: boolean;
}

export interface FuncaoRequest {
  funcao: string;
  salarioBase: number;
  ativo: boolean;
}

export const funcaoService = {
  listar: () => axios.get<Funcao[]>(`${API}/funcoes`),
  criar: (dto: FuncaoRequest) => axios.post<Funcao>(`${API}/funcoes`, dto),
  atualizar: (id: number, dto: FuncaoRequest) => axios.put<Funcao>(`${API}/funcoes/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/funcoes/${id}`),
};
