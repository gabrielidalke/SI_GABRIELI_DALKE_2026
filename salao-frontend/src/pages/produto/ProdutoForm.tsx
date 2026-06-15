import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { Produto } from '../../services/produtoService';
import { produtoService } from '../../services/produtoService';
import { ncmShService, type NcmSh } from '../../services/ncmShService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle } from '../../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const sel = { ...inputStyle, cursor: 'pointer' };

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Produto>({ nome: '', descricao: '', preco: 0, quantidade: 0, ativo: true, ncmShId: null });
  const [ncmShs, setNcmShs] = useState<NcmSh[]>([]);

  useEffect(() => {
    ncmShService.listar().then(r => setNcmShs(r.data)).catch(() => {});
    if (id) produtoService.buscar(Number(id)).then(r => setForm(r.data));
  }, [id]);

  const salvar = async () => {
    if (id) await produtoService.atualizar(Number(id), form);
    else await produtoService.salvar(form);
    navigate('/produtos');
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Produto</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do produto' : 'Preencha os dados do novo produto'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>
        <div style={g12}>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Produto *</label>
            <input style={inputStyle} placeholder="Nome do produto..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Preço (R$) *</label>
            <input type="number" style={inputStyle} placeholder="Ex: 45.90" value={form.preco} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} />
          </div>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Descrição</label>
            <input style={inputStyle} placeholder="Descrição do produto..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Quantidade</label>
            <input type="number" style={inputStyle} placeholder="Ex: 10" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} />
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>NCM / SH</label>
            <select
              style={sel}
              value={form.ncmShId || ''}
              onChange={e => setForm({ ...form, ncmShId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Selecione o NCM/SH</option>
              {ncmShs.map(n => (
                <option key={n.id} value={n.id}>{n.codigo}{n.descricao ? ` — ${n.descricao}` : ''}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
            <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={salvar} style={btnPrimary}>Salvar</button>
          <button onClick={() => navigate('/produtos')} style={btnCancel}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
