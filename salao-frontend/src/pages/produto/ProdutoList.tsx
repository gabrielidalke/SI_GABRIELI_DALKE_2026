import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Produto } from '../../services/produtoService';
import { produtoService } from '../../services/produtoService';

export default function ProdutoList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await produtoService.listar();
    setProdutos(res.data);
  };

  const deletar = async (id: number) => {
    if (confirm('Deseja excluir este produto?')) {
      await produtoService.deletar(id);
      carregar();
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>Produtos</h2>
          <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>Gerencie os produtos do salão</p>
        </div>
        <button onClick={() => navigate('/produtos/novo')} style={{ backgroundColor: '#C97B63', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}>
          + Novo Produto
        </button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #E8D5C8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(201,123,99,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5EDE3' }}>
              {['ID', 'Nome', 'Preço', 'Quantidade', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtos.map((p, i) => (
              <tr key={p.id} style={{ borderTop: '1px solid #F5EDE3', backgroundColor: i % 2 === 0 ? 'white' : '#FDFAF8' }}>
                <td style={{ padding: '14px 20px', color: '#8B6F61', fontSize: 14 }}>{p.id}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14, fontWeight: 500 }}>{p.nome}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>R$ {Number(p.preco).toFixed(2)}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>{p.quantidade}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ backgroundColor: p.ativo ? '#E8F5E9' : '#FBE9E7', color: p.ativo ? '#2E7D32' : '#C62828', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <button onClick={() => navigate(`/produtos/${p.id}`)} style={{ backgroundColor: 'transparent', border: '1px solid #C97B63', color: '#C97B63', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 8 }}>Editar</button>
                  <button onClick={() => deletar(p.id!)} style={{ backgroundColor: 'transparent', border: '1px solid #E8D5C8', color: '#8B6F61', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produtos.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#8B6F61' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum produto cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}