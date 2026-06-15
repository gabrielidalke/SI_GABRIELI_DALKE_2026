import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface ServicoInfo {
  id: number;
  nome: string;
  preco: number;
  duracaoMinutos: number;
}

export interface Agendamento {
  id: number;
  dataHora: string;
  observacao?: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'CONCLUIDO' | 'CANCELADO';
  valorTotal: number;
  criadoEm: string;
  nfseGerada?: boolean;
  cliente: { id: number; nome: string; telefone?: string };
  funcionario: { id: number; nome: string };
  servicos: ServicoInfo[];
}

export interface AgendamentoRequest {
  dataHora: string;
  observacao?: string;
  clienteId: number;
  funcionarioId: number;
  servicoIds: number[];
}

export const agendamentoService = {
  listar: () => axios.get<Agendamento[]>(`${API}/agendamentos`),
  buscar: (id: number) => axios.get<Agendamento>(`${API}/agendamentos/${id}`),
  listarPorData: (data: string) => axios.get<Agendamento[]>(`${API}/agendamentos/por-data?data=${data}`),
  criar: (dto: AgendamentoRequest) => axios.post<Agendamento>(`${API}/agendamentos`, dto),
  atualizar: (id: number, dto: AgendamentoRequest) => axios.put<Agendamento>(`${API}/agendamentos/${id}`, dto),
  deletar: (id: number) => axios.delete(`${API}/agendamentos/${id}`),
  confirmar: (id: number) => axios.post<Agendamento>(`${API}/agendamentos/${id}/confirmar`),
  concluir: (id: number) => axios.post<Agendamento>(`${API}/agendamentos/${id}/concluir`),
  cancelar: (id: number) => axios.post<Agendamento>(`${API}/agendamentos/${id}/cancelar`),
};
