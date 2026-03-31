import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';
export default function CategoriaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Categoria>({ nome: '', ativo: true });

  useEffect(() => {
    if (id) {
      categoriaService.buscar(Number(id)).then(res => setForm(res.data));
    }
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
    <div style={{ padding: 24 }}>
      <h2>{id ? 'Editar' : 'Nova'} Categoria</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Nome: </label>
        <input
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Ativo: </label>
        <input
          type="checkbox"
          checked={form.ativo}
          onChange={e => setForm({ ...form, ativo: e.target.checked })}
        />
      </div>

      <button onClick={salvar}>Salvar</button>
      {' '}
      <button onClick={() => navigate('/categorias')}>Voltar</button>
    </div>
  );
}