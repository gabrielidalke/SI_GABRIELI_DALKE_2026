import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { funcaoService, type Funcao } from '../services/funcaoService';
import { mensagemDeErro } from '../services/notaEntradaService';
import { inputStyle, labelStyle, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle, th, td } from '../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };

const ToggleYN = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC', width: 'fit-content', marginTop: 2 }}>
    <button type="button" onClick={() => onChange(true)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: value ? '#C97B6B' : 'white', color: value ? 'white' : '#8B6E63', transition: 'all 0.2s' }}>Sim</button>
    <button type="button" onClick={() => onChange(false)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: !value ? '#C97B6B' : 'white', color: !value ? 'white' : '#8B6E63', borderLeft: '1px solid #E8D5CC', transition: 'all 0.2s' }}>Não</button>
  </div>
);

// Salário fica como texto enquanto é digitado (o "." do decimal não pode sumir)
const EMPTY = { funcao: '', salarioBase: '', ativo: true };

// Funções/cargos do salão (cabeleireira, manicure, recepcionista...) com o salário base de cada uma
export default function Funcoes() {
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [lista, setLista] = useState<Funcao[]>([]);
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  const carregar = () => funcaoService.listar().then(r => setLista(r.data)).catch(() => setLista([]));

  useEffect(() => {
    funcaoService.listar().then(r => setLista(r.data)).catch(() => setLista([]));
  }, []);

  const set = (changes: Partial<typeof EMPTY>) => { setForm(prev => ({ ...prev, ...changes })); setErro(''); };

  const novoItem = () => {
    setEditId(null);
    setForm(EMPTY);
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const editar = (item: Funcao) => {
    setEditId(item.id);
    setForm({ funcao: item.funcao, salarioBase: String(item.salarioBase), ativo: item.ativo });
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const salvar = async () => {
    if (!form.funcao.trim()) { setErro('Nome da função é obrigatório.'); return; }
    if (form.salarioBase === '') { setErro('Salário base é obrigatório.'); return; }
    if (!(Number(form.salarioBase) >= 0)) { setErro('Salário base não pode ser negativo.'); return; }
    const dto = { funcao: form.funcao.trim(), salarioBase: Number(form.salarioBase), ativo: form.ativo };
    try {
      if (editId) await funcaoService.atualizar(editId, dto);
      else await funcaoService.criar(dto);
      setEditId(null);
      setForm(EMPTY);
      await carregar();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Erro ao salvar.'));
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta função?')) return;
    try { await funcaoService.deletar(id); carregar(); }
    catch (e) { alert(mensagemDeErro(e, 'Erro ao excluir.')); }
  };

  const filtrados = lista.filter(item => item.funcao.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Funções</h2>
        <p style={pageSubtitle}>Cadastre as funções dos funcionários e o salário base de cada uma</p>
      </div>

      <div ref={formRef} style={{ ...card, padding: 32, marginBottom: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Código</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }} value={editId ?? '(automático)'} disabled />
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Função *</label>
            <input style={inputStyle} placeholder="Ex.: Cabeleireira, Manicure, Recepcionista..." value={form.funcao}
              onChange={e => set({ funcao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Salário Base (R$) *</label>
            <input type="number" min={0} step={0.01} style={inputStyle} placeholder="0,00" value={form.salarioBase}
              onChange={e => set({ salarioBase: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => set({ ativo: v })} />
          </div>
        </div>
        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          {editId ? 'Atualizar Função' : 'Salvar Função'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3D2B1F', margin: 0 }}>
          Funções cadastradas{' '}
          <span style={{ fontSize: 13, color: '#8B6E63', fontFamily: 'Lato, sans-serif', fontWeight: 400 }}>
            ({filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'})
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, width: 220 }} placeholder="Buscar função..." value={busca} onChange={e => setBusca(e.target.value)} />
          <button onClick={novoItem} style={btnNew}>+ Nova Função</button>
        </div>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Função', 'Salário Base', 'Ativo', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, fontWeight: 500 }}>{item.funcao}</td>
                <td style={td}>R$ {Number(item.salarioBase).toFixed(2)}</td>
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
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma função cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
