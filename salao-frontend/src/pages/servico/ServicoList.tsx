import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';

export default function ServicoList() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await servicoService.listar();
    setServicos(res.data);
  };

  const deletar = async (id: number) => {
    if (confirm('Deseja excluir este serviço?')) {
      await servicoService.deletar(id);
      carregar();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Serviços</h2>
        <button onClick={() => navigate('/servicos/novo')}>+ Novo Serviço</button>
      </div>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Duração (min)</th>
            <th>Preço</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.nome}</td>
              <td>{s.duracaoMin}</td>
              <td>R$ {Number(s.preco).toFixed(2)}</td>
              <td>{s.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/servicos/${s.id}`)}>Editar</button>
                {' '}
                <button onClick={() => deletar(s.id!)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}