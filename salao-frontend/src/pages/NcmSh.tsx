import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { ncmShService, type NcmSh, type NcmShRequest } from '../services/ncmShService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const EMPTY: NcmShRequest = { codigo: '', descricao: '', ativo: true };

export default function NcmShPage() {
  const [lista,  setLista]  = useState<NcmSh[]>([]);
  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState<NcmShRequest & { id?: number }>(EMPTY);
  const [erro,   setErro]   = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await ncmShService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar NCM/SH:', e); }
  };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: NcmSh) => {
    setForm({ id: item.id, codigo: item.codigo, descricao: item.descricao || '', ativo: item.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.codigo.trim()) { setErro('Código é obrigatório.'); return; }
    try {
      form.id
        ? await ncmShService.atualizar(form.id, form)
        : await ncmShService.criar(form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este NCM/SH?')) return;
    try { await ncmShService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>NCM / SH</h2>
          <p style={pageSubtitle}>Nomenclatura Comum do Mercosul / Sistema Harmonizado</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Novo NCM/SH</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Código', 'Descrição', 'Status'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 600, fontFamily: 'monospace, monospace' }}>{item.codigo}</td>
                <td style={td}>{item.descricao || '—'}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum NCM/SH cadastrado</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                {form.id ? 'Editar NCM/SH' : 'Novo NCM/SH'}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>
            {erro && <p style={erroBanner}>{erro}</p>}

            <div style={g12}>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Código *</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: 3304.99.90"
                  value={form.codigo}
                  onChange={e => setForm({ ...form, codigo: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 8' }}>
                <label style={labelStyle}>Descrição</label>
                <input
                  style={inputStyle}
                  placeholder="Descrição do NCM/SH..."
                  value={form.descricao || ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="ativo-ncm"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }}
                />
                <label htmlFor="ativo-ncm" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setModal(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
