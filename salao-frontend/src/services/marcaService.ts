import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface Marca {
  id: number;
  marca: string;
  ativo: boolean;
}

export interface MarcaRequest {
  marca: string;
  ativo: boolean;
}

export const marcaService = {
  listar:      ()                               => axios.get<Marca[]>(`${API}/marcas`),
  buscarPorId: (id: number)                     => axios.get<Marca>(`${API}/marcas/${id}`),
  criar:       (dto: MarcaRequest)              => axios.post<Marca>(`${API}/marcas`, dto),
  atualizar:   (id: number, dto: MarcaRequest)  => axios.put<Marca>(`${API}/marcas/${id}`, dto),
  deletar:     (id: number)                     => axios.delete(`${API}/marcas/${id}`),
};
