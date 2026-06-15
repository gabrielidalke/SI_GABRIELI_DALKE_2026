import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../../styles/theme';

export default function FuncionarioList() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  const carregar = async () => { const r = await funcionarioService.listar(); setFuncionarios(r.data); };
  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este funcionário?')) return;
    try { await funcionarioService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Funcionários</h2>
          <p style={pageSubtitle}>Gerencie os funcionários do salão</p>
        </div>
        <button onClick={() => navigate('/funcionarios/novo')} style={btnNew}>+ Novo Funcionário</button>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Funcionário', 'Telefone', 'Email', 'Admissão', 'Comissão', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{f.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{f.nome}</td>
                <td style={td}>{f.telefone}</td>
                <td style={td}>{f.email}</td>
                <td style={td}>{f.dataAdmissao}</td>
                <td style={td}>{f.percentualComissao}%</td>
                <td style={td}><span style={badge(f.ativo)}>{f.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/funcionarios/${f.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(f.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {funcionarios.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum funcionário cadastrado</p></div>}
      </div>
    </div>
  );
}
