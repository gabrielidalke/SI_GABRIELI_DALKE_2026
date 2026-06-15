import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';

const input = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #E8D5C8',
  borderRadius: 8,
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  color: '#3D2B1F',
  backgroundColor: 'white',
  outline: 'none',
};

const label = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#8B6F61',
  marginBottom: 6,
  letterSpacing: 0.5,
  textTransform: 'uppercase' as const,
};

export default function CategoriaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Categoria>({ nome: '', ativo: true });

  useEffect(() => {
    if (id) categoriaService.buscar(Number(id)).then(res => setForm(res.data));
  }, [id]);

  const salvar = async () => {
    if (id) {
      await categoriaService.atualizar(Number(id), form);
    } else {
      await categoriaService.salvar(form);
    }
    navigate('/categorias');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>
          {id ? 'Editar' : 'Nova'} Categoria
        </h2>
        <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>
          {id ? 'Atualize os dados da categoria' : 'Preencha os dados da nova categoria'}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #E8D5C8', padding: 32, boxShadow: '0 2px 12px rgba(201,123,99,0.08)' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={label}>Nome *</label>
          <input
            style={input}
            placeholder="Ex: Cabelo, Unhas, Estética..."
            value={form.nome}
            onChange={e => setForm({ ...form, nome: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="ativo"
            checked={form.ativo}
            onChange={e => setForm({ ...form, ativo: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: '#C97B63', cursor: 'pointer' }}
          />
          <label htmlFor="ativo" style={{ ...label, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={salvar}
            style={{ backgroundColor: '#C97B63', color: 'white', border: 'none', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}
          >
            Salvar
          </button>
          <button
            onClick={() => navigate('/categorias')}
            style={{ backgroundColor: 'transparent', color: '#8B6F61', border: '1px solid #E8D5C8', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600 }}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}