import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';

export default function FuncionarioList() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await funcionarioService.listar();
    setFuncionarios(res.data);
  };

  const deletar = async (id: number) => {
    if (confirm('Deseja excluir este funcionário?')) {
      await funcionarioService.deletar(id);
      carregar();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Funcionários</h2>
        <button onClick={() => navigate('/funcionarios/novo')}>+ Novo Funcionário</button>
      </div>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Admissão</th>
            <th>Comissão %</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.map(f => (
            <tr key={f.id}>
              <td>{f.id}</td>
              <td>{f.nome}</td>
              <td>{f.telefone}</td>
              <td>{f.email}</td>
              <td>{f.dataAdmissao}</td>
              <td>{f.percentualComissao}%</td>
              <td>{f.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/funcionarios/${f.id}`)}>Editar</button>
                {' '}
                <button onClick={() => deletar(f.id!)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}