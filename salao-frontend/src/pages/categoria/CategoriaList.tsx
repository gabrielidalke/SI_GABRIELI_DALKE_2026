import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';

export default function CategoriaList() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

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
    <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>Categorias</h2>
          <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>Gerencie as categorias do salão</p>
        </div>
        <button
          onClick={() => navigate('/categorias/nova')}
          style={{
            backgroundColor: '#C97B63',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            cursor: 'pointer',
            fontFamily: 'Lato, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          + Nova Categoria
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: 12,
        border: '1px solid #E8D5C8',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(201,123,99,0.08)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5EDE3' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>ID</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>Nome</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat, index) => (
              <tr key={cat.id} style={{ borderTop: '1px solid #F5EDE3', backgroundColor: index % 2 === 0 ? 'white' : '#FDFAF8' }}>
                <td style={{ padding: '14px 20px', color: '#8B6F61', fontSize: 14 }}>{cat.id}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14, fontWeight: 500 }}>{cat.nome}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    backgroundColor: cat.ativo ? '#E8F5E9' : '#FBE9E7',
                    color: cat.ativo ? '#2E7D32' : '#C62828',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {cat.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <button
                    onClick={() => navigate(`/categorias/${cat.id}`)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #C97B63',
                      color: '#C97B63',
                      borderRadius: 6,
                      padding: '6px 16px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      marginRight: 8
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletar(cat.id!)}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #E8D5C8',
                      color: '#8B6F61',
                      borderRadius: 6,
                      padding: '6px 16px',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categorias.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#8B6F61' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma categoria cadastrada</p>
            <p style={{ fontSize: 14, marginTop: 8 }}>Clique em + Nova Categoria para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}