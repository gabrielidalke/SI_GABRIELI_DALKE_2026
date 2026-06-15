import { useEffect, useState } from 'react';
import { formaPagamentoService, type FormaPagamento, type FormaPagamentoRequest } from '../services/formaPagamentoService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: FormaPagamentoRequest = { formaPagamento: '', percentual: 0, numeroDias: 0, ativo: true };

export default function FormasPagamento() {
  const [lista, setLista] = useState<FormaPagamento[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormaPagamentoRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await formaPagamentoService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar formas de pagamento:', e); }
  };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: FormaPagamento) => {
    setForm({ id: item.id, formaPagamento: item.formaPagamento, percentual: item.percentual, numeroDias: item.numeroDias, ativo: item.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.formaPagamento.trim()) { setErro('Nome é obrigatório.'); return; }
    try {
      const dto: FormaPagamentoRequest = { formaPagamento: form.formaPagamento, percentual: form.percentual, numeroDias: form.numeroDias, ativo: form.ativo };
      form.id ? await formaPagamentoService.atualizar(form.id, dto) : await formaPagamentoService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta forma de pagamento?')) return;
    try { await formaPagamentoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Formas de Pagamento</h2>
          <p style={pageSubtitle}>Gerencie as formas de pagamento</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Forma de Pagamento</button>
      </div>

      <div style={card}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Forma de Pagamento', 'Percentual (%)', 'Nº Dias', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.formaPagamento}</td>
                <td style={td}>{item.percentual != null ? `${item.percentual}%` : '—'}</td>
                <td style={td}>{item.numeroDias != null ? item.numeroDias : '—'}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma forma de pagamento cadastrada</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Forma de Pagamento *</label>
                <input style={inputStyle} placeholder="Ex: Cartão de Crédito, PIX, Dinheiro..." value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Percentual (%)</label>
                  <input type="number" min={0} max={100} step={0.01} style={inputStyle} placeholder="Ex: 2.50" value={form.percentual ?? ''} onChange={e => setForm({ ...form, percentual: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
                <div>
                  <label style={labelStyle}>Nº Dias</label>
                  <input type="number" min={0} style={inputStyle} placeholder="Ex: 30" value={form.numeroDias ?? ''} onChange={e => setForm({ ...form, numeroDias: e.target.value === '' ? undefined : Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-forma" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-forma" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
