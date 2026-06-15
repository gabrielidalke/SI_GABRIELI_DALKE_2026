import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../../styles/theme';

export default function ServicoList() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);
  const carregar = async () => { const r = await servicoService.listar(); setServicos(r.data); };
  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try { await servicoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Serviços</h2>
          <p style={pageSubtitle}>Gerencie os serviços do salão</p>
        </div>
        <button onClick={() => navigate('/servicos/novo')} style={btnNew}>+ Novo Serviço</button>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Serviço', 'Duração', 'Preço', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}
              <th style={{ ...th, minWidth: 180 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.map(s => (
              <tr key={s.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{s.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{s.nome}</td>
                <td style={td}>{s.duracaoMin} min</td>
                <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(s.preco).toFixed(2)}</td>
                <td style={td}><span style={badge(s.ativo)}>{s.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/servicos/${s.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(s.id!)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {servicos.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum serviço cadastrado</p></div>}
      </div>
    </div>
  );
}
