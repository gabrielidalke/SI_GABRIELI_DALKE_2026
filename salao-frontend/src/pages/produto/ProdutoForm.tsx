import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Produto } from '../../services/produtoService';
import { produtoService } from '../../services/produtoService';

export default function ProdutoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Produto>({
    nome: '', descricao: '', preco: 0, quantidade: 0, ativo: true
  });

  useEffect(() => {
    if (id) produtoService.buscar(Number(id)).then(res => setForm(res.data));
  }, [id]);

  const salvar = async () => {
    if (id) {
      await produtoService.atualizar(Number(id), form);
    } else {
      await produtoService.salvar(form);
    }
    navigate('/produtos');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{id ? 'Editar' : 'Novo'} Produto</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Nome: </label>
        <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Descrição: </label>
        <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Preço: </label>
        <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Quantidade: </label>
        <input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Ativo: </label>
        <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
      </div>

      <button onClick={salvar}>Salvar</button>
      {' '}
      <button onClick={() => navigate('/produtos')}>Voltar</button>
    </div>
  );
}