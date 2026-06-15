import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface NcmSh {
  id: number;
  codigo: string;
  descricao?: string;
  ativo: boolean;
}

export interface NcmShRequest {
  codigo: string;
  descricao?: string;
  ativo: boolean;
}

export const ncmShService = {
  listar:      ()                                  => axios.get<NcmSh[]>(`${API}/ncm-sh`),
  buscarPorId: (id: number)                        => axios.get<NcmSh>(`${API}/ncm-sh/${id}`),
  criar:       (data: NcmShRequest)                => axios.post<NcmSh>(`${API}/ncm-sh`, data),
  atualizar:   (id: number, data: NcmShRequest)    => axios.put<NcmSh>(`${API}/ncm-sh/${id}`, data),
  deletar:     (id: number)                        => axios.delete(`${API}/ncm-sh/${id}`),
};
