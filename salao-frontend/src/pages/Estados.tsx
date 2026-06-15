import { useEffect, useState } from 'react';
import type { Estado, EstadoRequest } from '../services/estadoService';
import { estadoService } from '../services/estadoService';
import type { Pais } from '../services/paisService';
import { paisService } from '../services/paisService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: EstadoRequest = { nome: '', uf: '', paisId: undefined, ativo: true };

export default function Estados() {
  const [lista, setLista] = useState<Estado[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<EstadoRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); paisService.listar().then(r => setPaises(r.data)); }, []);

  const carregar = async () => { const r = await estadoService.listar(); setLista(r.data); };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (e: Estado) => {
    setForm({ id: e.id, nome: e.nome, uf: e.uf, paisId: e.paisId, ativo: e.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.uf.trim()) { setErro('Nome e UF são obrigatórios.'); return; }
    try {
      form.id ? await estadoService.atualizar(form.id, form) : await estadoService.salvar(form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este estado?')) return;
    try { await estadoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Estados</h2>
          <p style={pageSubtitle}>Gerencie os estados cadastrados</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Novo Estado</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Estado', 'UF', 'País', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(e => (
              <tr key={e.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{e.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{e.nome}</td>
                <td style={td}>{e.uf}</td>
                <td style={td}>{e.paisNome || '—'}</td>
                <td style={td}><span style={badge(e.ativo)}>{e.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(e)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(e.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum estado cadastrado</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Estado' : 'Novo Estado'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Estado *</label>
                <input style={inputStyle} placeholder="Nome do estado..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>UF *</label>
                  <input style={inputStyle} placeholder="Ex: SP" maxLength={2} value={form.uf} onChange={e => setForm({ ...form, uf: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label style={labelStyle}>País</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.paisId || ''} onChange={e => setForm({ ...form, paisId: e.target.value ? Number(e.target.value) : undefined })}>
                    <option value="">Selecione</option>
                    {paises.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.sigla})</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-estado" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-estado" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
