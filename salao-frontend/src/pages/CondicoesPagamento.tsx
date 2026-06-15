import { useEffect, useState } from 'react';
import { condicaoPagamentoService, type CondicaoPagamento, type CondicaoPagamentoRequest } from '../services/condicaoPagamentoService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: CondicaoPagamentoRequest = { condicao: '', multa: undefined, desconto: undefined, ativo: true };

export default function CondicoesPagamento() {
  const [lista, setLista] = useState<CondicaoPagamento[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<CondicaoPagamentoRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await condicaoPagamentoService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar condições de pagamento:', e); }
  };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: CondicaoPagamento) => {
    setForm({ id: item.id, condicao: item.condicao, multa: item.multa, desconto: item.desconto, ativo: item.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.condicao.trim()) { setErro('Condição é obrigatória.'); return; }
    try {
      const dto: CondicaoPagamentoRequest = { condicao: form.condicao, multa: form.multa, desconto: form.desconto, ativo: form.ativo };
      form.id ? await condicaoPagamentoService.atualizar(form.id, dto) : await condicaoPagamentoService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta condição de pagamento?')) return;
    try { await condicaoPagamentoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Condições de Pagamento</h2>
          <p style={pageSubtitle}>Gerencie as condições de pagamento</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Condição</button>
      </div>

      <div style={card}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Condição', 'Multa (%)', 'Desconto (%)', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.condicao}</td>
                <td style={td}>{item.multa != null ? `${item.multa}%` : '—'}</td>
                <td style={td}>{item.desconto != null ? `${item.desconto}%` : '—'}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma condição cadastrada</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Condição de Pagamento' : 'Nova Condição de Pagamento'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Condição de Pagamento *</label>
                <input style={inputStyle} placeholder="Ex: À Vista, 30/60/90 dias..." value={form.condicao} onChange={e => setForm({ ...form, condicao: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Multa (%)</label>
                  <input type="number" min={0} max={100} step={0.01} style={inputStyle} placeholder="Ex: 2.00" value={form.multa ?? ''} onChange={e => setForm({ ...form, multa: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label style={labelStyle}>Desconto (%)</label>
                  <input type="number" min={0} max={100} step={0.01} style={inputStyle} placeholder="Ex: 5.00" value={form.desconto ?? ''} onChange={e => setForm({ ...form, desconto: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-cond" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-cond" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
