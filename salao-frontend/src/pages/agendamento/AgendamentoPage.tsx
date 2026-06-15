import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { agendamentoService, type Agendamento, type AgendamentoRequest } from '../../services/agendamentoService';
import { clienteService, type Cliente } from '../../services/clienteService';
import { funcionarioService, type Funcionario } from '../../services/funcionarioService';
import { servicoService, type Servico } from '../../services/servicoService';
import { notaFiscalServicoService } from '../../services/notaFiscalServicoService';
import { inputStyle, labelStyle, modalOverlay, btnPrimary, btnCancel, erroBanner } from '../../styles/theme';

const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
  AGENDADO:   { label: 'Agendado',   bg: '#D1ECF1', color: '#0C5460' },
  CONFIRMADO: { label: 'Confirmado', bg: '#FFF3CD', color: '#856404' },
  CONCLUIDO:  { label: 'Concluído',  bg: '#D4EDDA', color: '#2D6A4F' },
  CANCELADO:  { label: 'Cancelado',  bg: '#F8D7DA', color: '#721C24' },
};

const hoje = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): AgendamentoRequest => ({ dataHora: '', observacao: '', clienteId: 0, funcionarioId: 0, servicoIds: [] });

const aBtn = (bg: string, color: string, border?: string) => ({
  backgroundColor: bg, color, border: border ?? 'none', borderRadius: 6,
  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'Lato, sans-serif',
} as React.CSSProperties);

export default function AgendamentoPage() {
  const [data, setData] = useState(hoje());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<AgendamentoRequest>(emptyForm());
  const [erro, setErro] = useState('');

  const carregarOpcoes = async () => {
    try {
      const [c, f, s] = await Promise.all([clienteService.listar(), funcionarioService.listar(), servicoService.listar()]);
      setClientes(c.data); setFuncionarios(f.data); setServicos(s.data);
    } catch (e) { console.error('Erro ao carregar opções:', e); }
  };

  useEffect(() => { carregarOpcoes(); }, []);
  useEffect(() => { carregar(); }, [data]);

  const carregar = async () => {
    const r = await agendamentoService.listarPorData(data);
    setAgendamentos(r.data);
  };

  const abrirNovo = () => { carregarOpcoes(); setEditandoId(null); setForm(emptyForm()); setErro(''); setModalAberto(true); };
  const abrirEditar = (ag: Agendamento) => {
    carregarOpcoes();
    setEditandoId(ag.id);
    setForm({ dataHora: ag.dataHora.slice(0, 16), observacao: ag.observacao ?? '', clienteId: ag.cliente.id, funcionarioId: ag.funcionario.id, servicoIds: ag.servicos.map(s => s.id) });
    setErro(''); setModalAberto(true);
  };
  const fechar = () => { setModalAberto(false); setErro(''); };

  const toggleServico = (id: number) =>
    setForm(p => ({ ...p, servicoIds: p.servicoIds.includes(id) ? p.servicoIds.filter(s => s !== id) : [...p.servicoIds, id] }));

  const valorPreview = () =>
    servicos.filter(s => s.id && form.servicoIds.includes(s.id)).reduce((a, s) => a + Number(s.preco), 0).toFixed(2);

  const salvar = async () => {
    setErro('');
    if (!form.dataHora || !form.clienteId || !form.funcionarioId || form.servicoIds.length === 0) {
      setErro('Preencha data/hora, cliente, funcionário e pelo menos um serviço.'); return;
    }
    const payload = { ...form, dataHora: form.dataHora.length === 16 ? form.dataHora + ':00' : form.dataHora };
    try {
      editandoId ? await agendamentoService.atualizar(editandoId, payload) : await agendamentoService.criar(payload);
      fechar(); carregar();
    } catch (e: any) { setErro(e?.response?.data?.message ?? 'Erro ao salvar.'); }
  };

  const acao = async (fn: () => Promise<any>) => {
    try { await fn(); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem ?? e?.response?.data?.message ?? 'Erro.'); }
  };

  const gerarNfse = async (id: number) => {
    try {
      await notaFiscalServicoService.gerarParaAgendamento(id);
      carregar();
    } catch (e: any) {
      alert(e?.response?.data?.mensagem ?? e?.response?.data?.message ?? 'Erro ao gerar NFS-e.');
    }
  };

  const horaStr = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    catch { return iso.slice(11, 16); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F', margin: 0 }}>Agendamentos</h2>
          <p style={{ color: '#8B6E63', fontSize: 14, marginTop: 4 }}>Gerencie os agendamentos do salão</p>
        </div>
        <button onClick={abrirNovo} style={{ backgroundColor: '#C97B6B', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}>
          + Novo Agendamento
        </button>
      </div>

      {/* Filtro de data refinado */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, backgroundColor: 'white', borderRadius: 10, border: '1px solid #F0E6DC', padding: '10px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 24 }}>
        <Calendar size={16} color="#C97B6B" />
        <input
          type="date"
          value={data}
          onChange={e => setData(e.target.value)}
          style={{ border: 'none', outline: 'none', fontFamily: 'Lato, sans-serif', fontSize: 14, color: '#3D2B1F', cursor: 'pointer', backgroundColor: 'transparent' }}
        />
        <span style={{ fontSize: 13, color: '#8B6E63', borderLeft: '1px solid #F0E6DC', paddingLeft: 14 }}>
          {agendamentos.length} agendamento(s)
        </span>
      </div>

      {/* Cards de agendamento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {agendamentos.map(ag => {
          const sc = statusCfg[ag.status] ?? statusCfg.AGENDADO;
          return (
            <div key={ag.id} style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #F0E6DC', padding: '16px 20px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Hora */}
              <div style={{ minWidth: 68, textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#C97B6B', fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>
                  {horaStr(ag.dataHora)}
                </div>
              </div>

              {/* Divisor */}
              <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: '#F0E6DC', flexShrink: 0 }} />

              {/* Conteúdo */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#3D2B1F', fontSize: 15, marginBottom: 2 }}>{ag.cliente?.nome ?? '—'}</div>
                <div style={{ fontSize: 13, color: '#8B6E63', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ag.servicos.map(s => s.nome).join(', ')}
                </div>
                <div style={{ fontSize: 12, color: '#8B6E63', marginTop: 3 }}>
                  {ag.funcionario?.nome} ·{' '}
                  <span style={{ color: '#C97B6B', fontWeight: 600 }}>R$ {Number(ag.valorTotal).toFixed(2)}</span>
                </div>
              </div>

              {/* Status + Ações */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {sc.label}
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {ag.status === 'AGENDADO' && (<>
                    <button style={aBtn('#D1ECF1', '#0C5460')} onClick={() => acao(() => agendamentoService.confirmar(ag.id))}>Confirmar</button>
                    <button style={aBtn('transparent', '#C97B6B', '1px solid #C97B6B')} onClick={() => abrirEditar(ag)}>Editar</button>
                    <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => acao(() => agendamentoService.cancelar(ag.id))}>Cancelar</button>
                  </>)}
                  {ag.status === 'CONFIRMADO' && (<>
                    <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => acao(() => agendamentoService.concluir(ag.id))}>Concluir</button>
                    <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => acao(() => agendamentoService.cancelar(ag.id))}>Cancelar</button>
                  </>)}
                  {ag.status === 'CONCLUIDO' && (<>
                    <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirEditar(ag)}>Ver</button>
                    {ag.nfseGerada
                      ? <span style={{ backgroundColor: '#D4EDDA', color: '#2D6A4F', padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'Lato, sans-serif' }}>NFS-e Emitida</span>
                      : <button style={aBtn('#D1ECF1', '#0C5460')} onClick={() => gerarNfse(ag.id)}>Gerar NFS-e</button>
                    }
                  </>)}
                  {ag.status === 'CANCELADO' && (
                    <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirEditar(ag)}>Ver</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {agendamentos.length === 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #F0E6DC', padding: 56, textAlign: 'center', color: '#8B6E63' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#3D2B1F', marginBottom: 8 }}>Nenhum agendamento nesta data</p>
          <p style={{ fontSize: 14 }}>Clique em + Novo Agendamento para começar</p>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div style={modalOverlay}>
          <div style={{ backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: 36, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                {editandoId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button onClick={fechar} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>

            {erro && <p style={erroBanner}>{erro}</p>}

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={labelStyle}>Data e Hora *</label>
                <input type="datetime-local" style={inputStyle} value={form.dataHora} onChange={e => setForm(p => ({ ...p, dataHora: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Cliente *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.clienteId || ''} onChange={e => setForm(p => ({ ...p, clienteId: Number(e.target.value) }))}>
                  <option value="">Selecione o cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Funcionário *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.funcionarioId || ''} onChange={e => setForm(p => ({ ...p, funcionarioId: Number(e.target.value) }))}>
                  <option value="">Selecione o funcionário</option>
                  {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Serviços *</label>
                <div style={{ border: '1px solid #E8D5CC', borderRadius: 8, maxHeight: 200, overflowY: 'auto', padding: '8px 12px' }}>
                  {servicos.map(s => (
                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid #F0E6DC' }}>
                      <input type="checkbox" checked={s.id ? form.servicoIds.includes(s.id) : false} onChange={() => s.id && toggleServico(s.id)} style={{ accentColor: '#C97B6B', width: 16, height: 16 }} />
                      <span style={{ flex: 1, fontSize: 14, color: '#3D2B1F' }}>{s.nome}</span>
                      <span style={{ fontSize: 12, color: '#8B6E63' }}>{s.duracaoMin}min</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#C97B6B' }}>R$ {Number(s.preco).toFixed(2)}</span>
                    </label>
                  ))}
                  {servicos.length === 0 && <p style={{ fontSize: 13, color: '#8B6E63', padding: '8px 0' }}>Nenhum serviço cadastrado</p>}
                </div>
              </div>

              <div style={{ backgroundColor: '#FDF0E8', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8B6E63', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Valor Total</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#C97B6B', fontFamily: 'Playfair Display, serif' }}>R$ {valorPreview()}</span>
              </div>

              <div>
                <label style={labelStyle}>Observação</label>
                <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} placeholder="Observações sobre o agendamento..." value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={fechar} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
