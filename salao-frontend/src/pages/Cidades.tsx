import { useEffect, useState } from 'react';
import type { Cidade, CidadeRequest } from '../services/cidadeService';
import { cidadeService } from '../services/cidadeService';
import type { Estado } from '../services/estadoService';
import { estadoService } from '../services/estadoService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: CidadeRequest = { nome: '', estadoId: undefined, ativo: true };

export default function Cidades() {
  const [lista, setLista] = useState<Cidade[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<CidadeRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); estadoService.listar().then(r => setEstados(r.data)); }, []);

  const carregar = async () => { const r = await cidadeService.listar(); setLista(r.data); };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (c: Cidade) => {
    setForm({ id: c.id, nome: c.nome, estadoId: c.estadoId, ativo: c.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) { setErro('Nome é obrigatório.'); return; }
    try {
      form.id ? await cidadeService.atualizar(form.id, form) : await cidadeService.salvar(form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta cidade?')) return;
    try { await cidadeService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Cidades</h2>
          <p style={pageSubtitle}>Gerencie as cidades cadastradas</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Cidade</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Cidade', 'Estado', 'UF', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{c.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{c.nome}</td>
                <td style={td}>{c.estadoNome || '—'}</td>
                <td style={td}>{c.estadoUf || '—'}</td>
                <td style={td}><span style={badge(c.ativo)}>{c.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(c)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(c.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma cidade cadastrada</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Cidade' : 'Nova Cidade'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input style={inputStyle} placeholder="Nome da cidade..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.estadoId || ''} onChange={e => setForm({ ...form, estadoId: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Selecione</option>
                  {estados.map(e => <option key={e.id} value={e.id}>{e.nome} ({e.uf})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-cidade" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-cidade" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
