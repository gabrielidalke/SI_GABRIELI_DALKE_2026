import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Produto } from '../../services/produtoService';
import { produtoService } from '../../services/produtoService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../../styles/theme';

export default function ProdutoList() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  const carregar = async () => { const r = await produtoService.listar(); setProdutos(r.data); };
  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try { await produtoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Produtos</h2>
          <p style={pageSubtitle}>Gerencie os produtos do salão</p>
        </div>
        <button onClick={() => navigate('/produtos/novo')} style={btnNew}>+ Novo Produto</button>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Produto', 'Preço', 'Quantidade', 'NCM/SH', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{p.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{p.nome}</td>
                <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(p.preco).toFixed(2)}</td>
                <td style={td}>{p.quantidade}</td>
                <td style={{ ...td, fontFamily: 'monospace, monospace', fontSize: 13 }}>{p.ncmSh?.codigo || '—'}</td>
                <td style={td}><span style={badge(p.ativo)}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/produtos/${p.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(p.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produtos.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum produto cadastrado</p></div>}
      </div>
    </div>
  );
}
