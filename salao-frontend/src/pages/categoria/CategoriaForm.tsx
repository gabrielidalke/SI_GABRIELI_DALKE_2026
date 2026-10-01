import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle, erroBanner } from '../../styles/theme';

export default function CategoriaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Categoria>({ nome: '', ativo: true });
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (id) categoriaService.buscar(Number(id)).then(r => setForm(r.data));
  }, [id]);

  const salvar = async () => {
    if (form.nome.trim().length < 3) { setErro('Nome da categoria deve ter pelo menos 3 letras.'); return; }
    try {
      if (id) await categoriaService.atualizar(Number(id), form);
      else await categoriaService.salvar(form);
      navigate('/categorias');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Nova'} Categoria</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados da categoria' : 'Preencha os dados da nova categoria'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Categoria *</label>
          <input style={inputStyle} placeholder="Nome da categoria..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
          <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={salvar} style={btnPrimary}>Salvar</button>
          <button onClick={() => navigate('/categorias')} style={btnCancel}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
