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
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>Funcionários</h2>
          <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>Gerencie os funcionários do salão</p>
        </div>
        <button onClick={() => navigate('/funcionarios/novo')} style={{ backgroundColor: '#C97B63', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}>
          + Novo Funcionário
        </button>
      </div>
      <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #E8D5C8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(201,123,99,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5EDE3' }}>
              {['ID', 'Nome', 'Telefone', 'Email', 'Admissão', 'Comissão', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#8B6F61', letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {funcionarios.map((f, i) => (
              <tr key={f.id} style={{ borderTop: '1px solid #F5EDE3', backgroundColor: i % 2 === 0 ? 'white' : '#FDFAF8' }}>
                <td style={{ padding: '14px 20px', color: '#8B6F61', fontSize: 14 }}>{f.id}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14, fontWeight: 500 }}>{f.nome}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>{f.telefone}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>{f.email}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>{f.dataAdmissao}</td>
                <td style={{ padding: '14px 20px', color: '#3D2B1F', fontSize: 14 }}>{f.percentualComissao}%</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{ backgroundColor: f.ativo ? '#E8F5E9' : '#FBE9E7', color: f.ativo ? '#2E7D32' : '#C62828', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {f.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <button onClick={() => navigate(`/funcionarios/${f.id}`)} style={{ backgroundColor: 'transparent', border: '1px solid #C97B63', color: '#C97B63', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 8 }}>Editar</button>
                  <button onClick={() => deletar(f.id!)} style={{ backgroundColor: 'transparent', border: '1px solid #E8D5C8', color: '#8B6F61', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {funcionarios.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#8B6F61' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum funcionário cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}