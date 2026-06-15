import axios from 'axios';

const API = 'http://localhost:8080/api';

export interface NotaFiscalServico {
  id: number;
  numeroNota: string;
  dataEmissao: string;
  cliente?: { id: number; nome: string };
  servicos?: { id: number; nome: string }[];
  agendamento?: {
    id: number;
    servicos?: { id: number; nome: string }[];
  };
  valorTotal: number;
  agendamentoId?: number;
}

export const notaFiscalServicoService = {
  listar:                ()               => axios.get<NotaFiscalServico[]>(`${API}/notas-fiscais-servico`),
  buscarPorId:           (id: number)     => axios.get<NotaFiscalServico>(`${API}/notas-fiscais-servico/${id}`),
  gerarParaAgendamento:  (agendamentoId: number) => axios.post<NotaFiscalServico>(`${API}/notas-fiscais-servico/gerar/${agendamentoId}`),
};
