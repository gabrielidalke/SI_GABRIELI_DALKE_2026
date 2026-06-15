import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cliente } from '../../services/clienteService';
import { clienteService } from '../../services/clienteService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../../styles/theme';

export default function ClienteList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  const carregar = async () => { const r = await clienteService.listar(); setClientes(r.data); };
  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try { await clienteService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Clientes</h2>
          <p style={pageSubtitle}>Gerencie os clientes do salão</p>
        </div>
        <button onClick={() => navigate('/clientes/novo')} style={btnNew}>+ Novo Cliente</button>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Cliente', 'Telefone', 'Email', 'CPF', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{c.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{c.nome}</td>
                <td style={td}>{c.telefone || '—'}</td>
                <td style={td}>{c.email || '—'}</td>
                <td style={td}>{c.cpf || '—'}</td>
                <td style={td}><span style={badge(c.ativo)}>{c.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/clientes/${c.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(c.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientes.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum cliente cadastrado</p></div>}
      </div>
    </div>
  );
}
