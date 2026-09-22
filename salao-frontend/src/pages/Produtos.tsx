import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Produto } from '../services/produtoService';
import { produtoService } from '../services/produtoService';
import type { Marca } from '../services/marcaService';
import { marcaService } from '../services/marcaService';
import type { UnidadeMedida } from '../services/unidadeMedidaService';
import { unidadeMedidaService } from '../services/unidadeMedidaService';
import type { Categoria } from '../services/categoriaService';
import { categoriaService } from '../services/categoriaService';
import type { NcmSh } from '../services/ncmShService';
import { ncmShService } from '../services/ncmShService';
import { inputStyle, labelStyle, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle, th, td } from '../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };

const ToggleYN = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC', width: 'fit-content', marginTop: 2 }}>
    <button type="button" onClick={() => onChange(true)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: value ? '#C97B6B' : 'white', color: value ? 'white' : '#8B6E63', transition: 'all 0.2s' }}>Sim</button>
    <button type="button" onClick={() => onChange(false)} style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: !value ? '#C97B6B' : 'white', color: !value ? 'white' : '#8B6E63', borderLeft: '1px solid #E8D5CC', transition: 'all 0.2s' }}>Não</button>
  </div>
);

interface FormState {
  nome: string;
  precoVenda: number | '';
  quantidade: number | '';
  ativo: boolean;
  ncmShId: number | null;
  marcaId: number | null;
  unidadeMedidaId: number | null;
  categoriaId: number | null;
  precoCusto: number | '';
  desconto: number | '';
}

const EMPTY: FormState = {
  nome: '', precoVenda: '', quantidade: '', ativo: true,
  ncmShId: null, marcaId: null, unidadeMedidaId: null, categoriaId: null,
  precoCusto: '', desconto: '',
};

export default function Produtos() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [lista, setLista] = useState<Produto[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ncmShs, setNcmShs] = useState<NcmSh[]>([]);
  const [busca, setBusca] = useState('');
  const [termoBusca, setTermoBusca] = useState('');
  const [erro, setErro] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      produtoService.listar(),
      marcaService.listar(),
      unidadeMedidaService.listar(),
      categoriaService.listar(),
      ncmShService.listar(),
    ]).then(([pRes, mRes, uRes, cRes, nRes]) => {
      setLista(pRes.data);
      setMarcas(mRes.data);
      setUnidades(uRes.data);
      setCategorias(cRes.data);
      setNcmShs(nRes.data);
    }).catch(() => {});
  }, []);

  const carregar = async () => {
    try { const r = await produtoService.listar(); setLista(r.data); }
    catch { setLista([]); }
  };

  const novoItem = () => {
    setEditId(null);
    setForm(EMPTY);
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const editar = (item: Produto) => {
    setEditId(item.id!);
    setForm({
      nome: item.nome,
      precoVenda: item.precoVenda ?? item.preco,
      quantidade: item.quantidade,
      ativo: item.ativo,
      ncmShId: item.ncmSh?.id ?? item.ncmShId ?? null,
      marcaId: item.marca?.id ?? item.marcaId ?? null,
      unidadeMedidaId: item.unidadeMedida?.id ?? item.unidadeMedidaId ?? null,
      categoriaId: item.categoria?.id ?? item.categoriaId ?? null,
      precoCusto: item.precoCusto ?? '',
      desconto: item.desconto ?? '',
    });
    setErro('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const salvar = async () => {
    if (!form.nome.trim()) { setErro('Nome do produto é obrigatório.'); return; }
    if (form.precoVenda === '' || Number(form.precoVenda) <= 0) { setErro('Valor de venda é obrigatório.'); return; }
    setErro('');
    const dto: Produto = {
      nome: form.nome,
      precoVenda: parseFloat(String(form.precoVenda)),
      quantidade: form.quantidade === '' ? 0 : Number(form.quantidade),
      ativo: form.ativo,
      ncmShId: form.ncmShId,
      marcaId: form.marcaId,
      unidadeMedidaId: form.unidadeMedidaId,
      categoriaId: form.categoriaId,
      precoCusto: form.precoCusto === '' ? undefined : Number(form.precoCusto),
      desconto: form.desconto === '' ? 0 : Number(form.desconto),
    };
    console.log('Enviando produto:', dto);
    try {
      if (editId) await produtoService.atualizar(editId, dto);
      else await produtoService.salvar(dto);
      setEditId(null);
      setForm(EMPTY);
      await carregar();
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try { await produtoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  const filtrados = lista.filter(item =>
    item.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (item.categoria?.nome || '').toLowerCase().includes(termoBusca.toLowerCase()) ||
    (item.marca?.marca || '').toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Produtos</h2>
        <p style={pageSubtitle}>Gerencie o catálogo de produtos do salão</p>
      </div>

      <div ref={formRef} style={{ ...card, padding: 32, marginBottom: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}

        {/* Linha 1: Código, Produto, Categoria, Ativo */}
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Código</label>
            <input
              style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }}
              value={editId ?? '(automático)'}
              disabled
            />
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Produto *</label>
            <input
              style={inputStyle}
              placeholder="Nome do produto..."
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Categoria</label>
            <select
              style={sel}
              value={form.categoriaId || ''}
              onChange={e => setForm({ ...form, categoriaId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => setForm({ ...form, ativo: v })} />
          </div>
        </div>

        {/* Linha 2: Marca, Unidade de Medida, NCM/SH */}
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Marca</label>
            <select
              style={sel}
              value={form.marcaId || ''}
              onChange={e => setForm({ ...form, marcaId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.marca}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Unidade de Medida</label>
            <select
              style={sel}
              value={form.unidadeMedidaId || ''}
              onChange={e => setForm({ ...form, unidadeMedidaId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione</option>
              {unidades.map(u => <option key={u.id} value={u.id}>{u.unidadeMedida} ({u.sigla})</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>NCM / SH</label>
            <select
              style={sel}
              value={form.ncmShId || ''}
              onChange={e => setForm({ ...form, ncmShId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione</option>
              {ncmShs.map(n => <option key={n.id} value={n.id}>{n.codigo}{n.descricao ? ` — ${n.descricao}` : ''}</option>)}
            </select>
          </div>
        </div>

        {/* Linha 3: Valor Venda, Preço Custo, Estoque, Desconto */}
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Valor Venda (R$) *</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 45.90"
              value={form.precoVenda}
              onChange={e => setForm({ ...form, precoVenda: e.target.value === '' ? '' : parseFloat(e.target.value) })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Preço de Custo (R$)</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 20.00"
              value={form.precoCusto}
              onChange={e => setForm({ ...form, precoCusto: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Estoque</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 10"
              value={form.quantidade}
              onChange={e => setForm({ ...form, quantidade: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Desconto (%)</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 5"
              value={form.desconto}
              onChange={e => setForm({ ...form, desconto: e.target.value === '' ? '' : Number(e.target.value) })}
            />
          </div>
        </div>

        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          {editId ? 'Atualizar Produto' : 'Salvar Produto'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3D2B1F', margin: 0 }}>
          Produtos cadastrados{' '}
          <span style={{ fontSize: 13, color: '#8B6E63', fontFamily: 'Lato, sans-serif', fontWeight: 400 }}>
            ({filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'})
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ ...inputStyle, width: 260 }}
            placeholder="Buscar produto, marca, categoria..."
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
          <button onClick={novoItem} style={btnNew}>+ Novo Produto</button>
        </div>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Código', 'Produto', 'Categoria', 'Marca', 'Valor', 'Estoque', 'Ativo', 'Ações'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.nome}</td>
                <td style={td}>{item.categoria?.nome || '—'}</td>
                <td style={td}>{item.marca?.marca || '—'}</td>
                <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.precoVenda ?? item.preco ?? 0)}
                </td>
                <td style={td}>{item.quantidade}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => editar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum produto cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
