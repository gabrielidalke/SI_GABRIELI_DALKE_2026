import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';

export default function ServicoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Servico>({
    nome: '', descricao: '', duracaoMin: 0, preco: 0, ativo: true
  });

  useEffect(() => {
    if (id) servicoService.buscar(Number(id)).then(res => setForm(res.data));
  }, [id]);

  const salvar = async () => {
    if (id) {
      await servicoService.atualizar(Number(id), form);
    } else {
      await servicoService.salvar(form);
    }
    navigate('/servicos');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{id ? 'Editar' : 'Novo'} Serviço</h2>

      <div style={{ marginBottom: 12 }}>
        <label>Nome: </label>
        <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Descrição: </label>
        <input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Duração (min): </label>
        <input type="number" value={form.duracaoMin} onChange={e => setForm({ ...form, duracaoMin: Number(e.target.value) })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Preço: </label>
        <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Ativo: </label>
        <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
      </div>

      <button onClick={salvar}>Salvar</button>
      {' '}
      <button onClick={() => navigate('/servicos')}>Voltar</button>
    </div>
  );
}