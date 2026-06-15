import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Categoria } from '../../services/categoriaService';
import { categoriaService } from '../../services/categoriaService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../../styles/theme';

export default function CategoriaList() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  const carregar = async () => { const r = await categoriaService.listar(); setCategorias(r.data); };
  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    try { await categoriaService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Categorias</h2>
          <p style={pageSubtitle}>Gerencie as categorias do salão</p>
        </div>
        <button onClick={() => navigate('/categorias/nova')} style={btnNew}>+ Nova Categoria</button>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Categoria', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{cat.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{cat.nome}</td>
                <td style={td}><span style={badge(cat.ativo)}>{cat.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/categorias/${cat.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(cat.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categorias.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma categoria cadastrada</p></div>}
      </div>
    </div>
  );
}
