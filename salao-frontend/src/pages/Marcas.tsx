import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Marca, MarcaRequest } from '../services/marcaService';
import { marcaService } from '../services/marcaService';
import { inputStyle, labelStyle, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle, th, td } from '../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };

const ToggleYN = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC', width: 'fit-content', marginTop: 2 }}>
    <button type="button" onClick={() => onChange(true)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: value ? '#C97B6B' : 'white', color: value ? 'white' : '#8B6E63', transition: 'all 0.2s' }}>Sim</button>
    <button type="button" onClick={() => onChange(false)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: !value ? '#C97B6B' : 'white', color: !value ? 'white' : '#8B6E63', borderLeft: '1px solid #E8D5CC', transition: 'all 0.2s' }}>Não</button>
  </div>
);

const EMPTY: MarcaRequest = { marca: '', ativo: true };

export default function Marcas() {
  const [form, setForm] = useState<MarcaRequest>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [lista, setLista] = useState<Marca[]>([]);
  const [busca, setBusca] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [erro, setErro] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await marcaService.listar(); setLista(r.data); }
    catch { setLista([]); }
  };

  const novoItem = () => {
    setEditId(null);
    setForm(EMPTY);
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const editar = (item: Marca) => {
    setEditId(item.id);
    setForm({ marca: item.marca, ativo: item.ativo });
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const salvar = async () => {
    if (!form.marca.trim()) { setErro('Nome da marca é obrigatório.'); return; }
    setErro('');
    try {
      if (editId) await marcaService.atualizar(editId, form);
      else await marcaService.criar(form);
      setEditId(null);
      setForm(EMPTY);
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta marca?')) return;
    try { await marcaService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  const filtrados = lista.filter(item =>
    item.marca.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Marcas</h2>
        <p style={pageSubtitle}>Cadastre as marcas dos produtos</p>
      </div>

      <div ref={formRef} style={{ ...card, padding: 32, marginBottom: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Código</label>
            <input
              style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }}
              value={editId ?? '(automático)'}
              disabled
            />
          </div>
          <div style={{ gridColumn: 'span 7' }}>
            <label style={labelStyle}>Marca *</label>
            <input
              style={inputStyle}
              placeholder="Nome da marca..."
              value={form.marca}
              onChange={e => setForm({ ...form, marca: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => setForm({ ...form, ativo: v })} />
          </div>
        </div>
        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          {editId ? 'Atualizar Marca' : 'Salvar Marca'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3D2B1F', margin: 0 }}>
          Marcas cadastradas{' '}
          <span style={{ fontSize: 13, color: '#8B6E63', fontFamily: 'Lato, sans-serif', fontWeight: 400 }}>
            ({filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'})
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputStyle, width: 220 }}
            placeholder="Buscar marca..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setTermoBusca(busca)}
          />
          <button
            onClick={() => setTermoBusca(busca)}
            style={{ backgroundColor: '#C97B6B', color: 'white', border: 'none', borderRadius: 8, padding: '0 18px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 13, fontWeight: 600 }}
          >
            Pesquisar
          </button>
          <button onClick={novoItem} style={btnNew}>+ Nova Marca</button>
        </div>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Marca', 'Ativo', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, fontWeight: 500 }}>{item.marca}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => editar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma marca cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
