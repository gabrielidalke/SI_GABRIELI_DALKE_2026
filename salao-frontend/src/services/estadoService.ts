import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Estado {
  id: number;
  nome: string;
  uf: string;
}

export const estadoService = {
  listar: () => axios.get<Estado[]>(`${API}/estados`),
};