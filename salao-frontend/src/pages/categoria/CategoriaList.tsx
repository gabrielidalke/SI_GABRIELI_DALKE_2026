import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';
export default function CategoriaList() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    const res = await categoriaService.listar();
    setCategorias(res.data);
  };

  const deletar = async (id: number) => {
    if (confirm('Deseja excluir esta categoria?')) {
      await categoriaService.deletar(id);
      carregar();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Categorias</h2>
        <button onClick={() => navigate('/categorias/nova')}>+ Nova Categoria</button>
      </div>

      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.nome}</td>
              <td>{cat.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/categorias/${cat.id}`)}>Editar</button>
                {' '}
                <button onClick={() => deletar(cat.id!)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}