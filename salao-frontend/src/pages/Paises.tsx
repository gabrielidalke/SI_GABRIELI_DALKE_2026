import { useEffect, useState } from 'react';
import type { Pais, PaisRequest } from '../services/paisService';
import { paisService } from '../services/paisService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: PaisRequest = { nome: '', sigla: '', nacionalidade: '', moeda: '', ativo: true };

export default function Paises() {
  const [lista, setLista] = useState<Pais[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<PaisRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => { const r = await paisService.listar(); setLista(r.data); };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (p: Pais) => {
    setForm({ id: p.id, nome: p.nome, sigla: p.sigla, nacionalidade: p.nacionalidade || '', moeda: p.moeda || '', ativo: p.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.sigla.trim()) { setErro('Nome e sigla são obrigatórios.'); return; }
    try {
      form.id ? await paisService.atualizar(form.id, form) : await paisService.salvar(form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este país?')) return;
    try { await paisService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Países</h2>
          <p style={pageSubtitle}>Gerencie os países cadastrados</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Novo País</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'País', 'Sigla', 'Nacionalidade', 'Moeda', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{p.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{p.nome}</td>
                <td style={td}>{p.sigla}</td>
                <td style={td}>{p.nacionalidade || '—'}</td>
                <td style={td}>{p.moeda || '—'}</td>
                <td style={td}><span style={badge(p.ativo)}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(p)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(p.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum país cadastrado</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar País' : 'Novo País'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>País *</label>
                <input style={inputStyle} placeholder="Nome do país..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Sigla *</label>
                  <input style={inputStyle} placeholder="Ex: BR" maxLength={3} value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label style={labelStyle}>Moeda</label>
                  <input style={inputStyle} placeholder="Ex: Real" value={form.moeda || ''} onChange={e => setForm({ ...form, moeda: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Nacionalidade</label>
                <input style={inputStyle} placeholder="Ex: Brasileiro" value={form.nacionalidade || ''} onChange={e => setForm({ ...form, nacionalidade: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-pais" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-pais" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
