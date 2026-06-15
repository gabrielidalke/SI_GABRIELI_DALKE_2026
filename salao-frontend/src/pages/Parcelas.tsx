import { useEffect, useState } from 'react';
import { parcelaService, type Parcela, type ParcelaRequest } from '../services/parcelaService';
import { formaPagamentoService, type FormaPagamento } from '../services/formaPagamentoService';
import { condicaoPagamentoService, type CondicaoPagamento } from '../services/condicaoPagamentoService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: ParcelaRequest = { numeroDias: 0, formaPagamentoId: 0, condicaoPagamentoId: 0, ativo: true };

export default function Parcelas() {
  const [lista, setLista] = useState<Parcela[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ParcelaRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await parcelaService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar parcelas:', e); }
  };

  const carregarOpcoes = async () => {
    try {
      const [f, c] = await Promise.all([formaPagamentoService.listar(), condicaoPagamentoService.listar()]);
      setFormas(f.data); setCondicoes(c.data);
    } catch (e) { console.error('Erro ao carregar opções:', e); }
  };

  const abrirNovo = () => { carregarOpcoes(); setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: Parcela) => {
    carregarOpcoes();
    setForm({ id: item.id, numeroDias: item.numeroDias, formaPagamentoId: item.formaPagamento.id, condicaoPagamentoId: item.condicaoPagamento.id, ativo: item.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.numeroDias || form.numeroDias < 0) { setErro('Número de dias é obrigatório.'); return; }
    if (!form.formaPagamentoId) { setErro('Selecione a forma de pagamento.'); return; }
    if (!form.condicaoPagamentoId) { setErro('Selecione a condição de pagamento.'); return; }
    try {
      const dto: ParcelaRequest = { numeroDias: form.numeroDias, formaPagamentoId: form.formaPagamentoId, condicaoPagamentoId: form.condicaoPagamentoId, ativo: form.ativo };
      form.id ? await parcelaService.atualizar(form.id, dto) : await parcelaService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta parcela?')) return;
    try { await parcelaService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Parcelas</h2>
          <p style={pageSubtitle}>Gerencie as parcelas de pagamento</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Parcela</button>
      </div>

      <div style={card}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Nº Dias', 'Forma de Pagamento', 'Condição de Pagamento', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.numeroDias}</td>
                <td style={td}>{item.formaPagamento?.formaPagamento ?? '—'}</td>
                <td style={td}>{item.condicaoPagamento?.condicao ?? '—'}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma parcela cadastrada</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Parcela' : 'Nova Parcela'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Número de Dias *</label>
                <input type="number" min={0} style={inputStyle} placeholder="Ex: 30" value={form.numeroDias || ''} onChange={e => setForm({ ...form, numeroDias: Number(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Forma de Pagamento *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.formaPagamentoId || ''} onChange={e => setForm({ ...form, formaPagamentoId: Number(e.target.value) })}>
                  <option value="">Selecione a forma de pagamento</option>
                  {formas.map(f => <option key={f.id} value={f.id}>{f.formaPagamento}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Condição de Pagamento *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.condicaoPagamentoId || ''} onChange={e => setForm({ ...form, condicaoPagamentoId: Number(e.target.value) })}>
                  <option value="">Selecione a condição de pagamento</option>
                  {condicoes.map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-parcela" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-parcela" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setModal(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
