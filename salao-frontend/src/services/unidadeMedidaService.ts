import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface UnidadeMedida {
  id: number;
  unidadeMedida: string;
  sigla: string;
  ativo: boolean;
}

export interface UnidadeMedidaRequest {
  unidadeMedida: string;
  sigla: string;
  ativo: boolean;
}

export const unidadeMedidaService = {
  listar:      ()                                      => axios.get<UnidadeMedida[]>(`${API}/unidades-medida`),
  buscarPorId: (id: number)                            => axios.get<UnidadeMedida>(`${API}/unidades-medida/${id}`),
  criar:       (dto: UnidadeMedidaRequest)             => axios.post<UnidadeMedida>(`${API}/unidades-medida`, dto),
  atualizar:   (id: number, dto: UnidadeMedidaRequest) => axios.put<UnidadeMedida>(`${API}/unidades-medida/${id}`, dto),
  deletar:     (id: number)                            => axios.delete(`${API}/unidades-medida/${id}`),
};
