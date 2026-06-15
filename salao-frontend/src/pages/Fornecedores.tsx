import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from 'axios';
import { cidadeService, type Cidade } from '../services/cidadeService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner, sectionTitle } from '../styles/theme';

const API = 'http://localhost:8080/api';
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };

interface Fornecedor {
  id: number;
  fornecedor: string;
  cpfCnpj?: string;
  fone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  inscricaoEstadual?: string;
  cidadeId?: number | null;
  ativo: boolean;
}

interface FornecedorRequest {
  fornecedor: string;
  cpfCnpj?: string;
  fone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cep?: string;
  inscricaoEstadual?: string;
  cidadeId?: number | null;
  ativo: boolean;
}

const EMPTY: FornecedorRequest = {
  fornecedor: '', cpfCnpj: '', fone: '', email: '', endereco: '',
  bairro: '', cep: '', inscricaoEstadual: '', cidadeId: null, ativo: true,
};

const sel = { ...inputStyle, cursor: 'pointer' };

export default function Fornecedores() {
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FornecedorRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await axios.get<Fornecedor[]>(`${API}/fornecedores`);
      setLista(r.data);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e);
      setLista([]);
    }
  };

  const carregarCidades = async () => {
    try { const r = await cidadeService.listar(); setCidades(r.data); }
    catch (e) { console.error('Erro ao carregar cidades:', e); }
  };

  const abrirNovo = () => { carregarCidades(); setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: Fornecedor) => {
    carregarCidades();
    setForm({
      id: item.id,
      fornecedor: item.fornecedor,
      cpfCnpj: item.cpfCnpj || '',
      fone: item.fone || '',
      email: item.email || '',
      endereco: item.endereco || '',
      bairro: item.bairro || '',
      cep: item.cep || '',
      inscricaoEstadual: item.inscricaoEstadual || '',
      cidadeId: item.cidadeId ?? null,
      ativo: item.ativo,
    });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (!form.fornecedor.trim()) { setErro('Fornecedor é obrigatório.'); return; }
    try {
      const dto: FornecedorRequest = {
        fornecedor: form.fornecedor,
        cpfCnpj: form.cpfCnpj,
        endereco: form.endereco,
        bairro: form.bairro,
        cep: form.cep,
        fone: form.fone,
        inscricaoEstadual: form.inscricaoEstadual,
        ativo: form.ativo,
        cidadeId: form.cidadeId || null,
      };
      if (form.id) {
        await axios.put(`${API}/fornecedores/${form.id}`, dto);
      } else {
        await axios.post(`${API}/fornecedores`, dto);
      }
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este fornecedor?')) return;
    try { await axios.delete(`${API}/fornecedores/${id}`); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  const set = (field: keyof FornecedorRequest, value: string | boolean | number | null) =>
    setForm(f => ({ ...f, [field]: value }));

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Fornecedores</h2>
          <p style={pageSubtitle}>Gerencie os fornecedores do salão</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Novo Fornecedor</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Fornecedor', 'CPF/CNPJ', 'Telefone', 'Status'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.fornecedor}</td>
                <td style={td}>{item.cpfCnpj || '—'}</td>
                <td style={td}>{item.fone || '—'}</td>
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
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum fornecedor cadastrado</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>
              {form.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h3>
            {erro && <p style={erroBanner}>{erro}</p>}

            <p style={{ ...sectionTitle, marginTop: 0 }}>Dados Principais</p>
            <div style={g12}>
              <div style={{ gridColumn: 'span 12' }}>
                <label style={labelStyle}>Fornecedor *</label>
                <input
                  style={inputStyle}
                  placeholder="Nome da empresa ou pessoa..."
                  value={form.fornecedor}
                  onChange={e => set('fornecedor', e.target.value)}
                />
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={labelStyle}>CPF / CNPJ</label>
                <input style={inputStyle} placeholder="000.000.000-00" value={form.cpfCnpj || ''} onChange={e => set('cpfCnpj', e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={labelStyle}>Telefone</label>
                <input style={inputStyle} placeholder="(00) 00000-0000" value={form.fone || ''} onChange={e => set('fone', e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 8' }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} placeholder="email@fornecedor.com" value={form.email || ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Inscrição Estadual</label>
                <input style={inputStyle} placeholder="IE" value={form.inscricaoEstadual || ''} onChange={e => set('inscricaoEstadual', e.target.value)} />
              </div>
            </div>

            <p style={sectionTitle}>Endereço</p>
            <div style={g12}>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>CEP</label>
                <input style={inputStyle} placeholder="00000-000" value={form.cep || ''} onChange={e => set('cep', e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 5' }}>
                <label style={labelStyle}>Bairro</label>
                <input style={inputStyle} placeholder="Bairro" value={form.bairro || ''} onChange={e => set('bairro', e.target.value)} />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <label style={labelStyle}>Cidade</label>
                <select
                  style={sel}
                  value={form.cidadeId || ''}
                  onChange={e => set('cidadeId', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Selecione</option>
                  {cidades.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}{c.estadoUf ? ` / ${c.estadoUf}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: 'span 12' }}>
                <label style={labelStyle}>Endereço</label>
                <input style={inputStyle} placeholder="Rua, Avenida..." value={form.endereco || ''} onChange={e => set('endereco', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <input type="checkbox" id="ativo-forn" checked={form.ativo} onChange={e => set('ativo', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
              <label htmlFor="ativo-forn" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
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
