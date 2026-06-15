import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Cidade {
  id: number;
  nome: string;
  estado: { id: number; nome: string; uf: string };
}

export const cidadeService = {
  listarPorEstado: (estadoId: number) => axios.get<Cidade[]>(`${API}/cidades/por-estado/${estadoId}`),
};