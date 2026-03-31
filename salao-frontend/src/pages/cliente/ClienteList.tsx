import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '../../services/clienteService';
import { clienteService } from '../../services/clienteService';

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await clienteService.listar();
    setClientes(res.data);
  };

  const deletar = async (id: number) => {
    if (confirm('Deseja excluir este cliente?')) {
      await clienteService.deletar(id);
      carregar();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Clientes</h2>
        <button onClick={() => navigate('/clientes/novo')}>+ Novo Cliente</button>
      </div>
      <table border={1} cellPadding={8} width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>CPF</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.nome}</td>
              <td>{c.telefone}</td>
              <td>{c.email}</td>
              <td>{c.cpf}</td>
              <td>{c.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/clientes/${c.id}`)}>Editar</button>
                {' '}
                <button onClick={() => deletar(c.id!)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}