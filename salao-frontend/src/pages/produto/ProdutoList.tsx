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
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Produtos</h2>
        <button onClick={() => navigate('/produtos/novo')}>+ Novo Produto</button>
      </div>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Quantidade</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nome}</td>
              <td>R$ {Number(p.preco).toFixed(2)}</td>
              <td>{p.quantidade}</td>
              <td>{p.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/produtos/${p.id}`)}>Editar</button>
                {' '}
                <button onClick={() => deletar(p.id!)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}