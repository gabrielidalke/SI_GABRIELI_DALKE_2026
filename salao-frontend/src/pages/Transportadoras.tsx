import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transportadoraService } from '../services/transportadoraService';
import type { Transportadora } from '../services/transportadoraService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../styles/theme';

export default function Transportadoras() {
  const [lista, setLista] = useState<Transportadora[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await transportadoraService.listar();
      setLista(r.data);
    } catch (e) {
      console.error('Erro ao carregar transportadoras:', e);
      setLista([]);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta transportadora?')) return;
    try { await transportadoraService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Transportadoras</h2>
          <p style={pageSubtitle}>Gerencie as transportadoras usadas nas compras</p>
        </div>
        <button onClick={() => navigate('/transportadoras/nova')} style={btnNew}>+ Nova Transportadora</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Transportadora', 'CPF/CNPJ', 'Telefone', 'Cidade', 'Status'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.nome}</td>
                <td style={td}>{item.cpfCnpj || '—'}</td>
                <td style={td}>{item.fone || '—'}</td>
                <td style={td}>{item.cidade?.nome || '—'}</td>
                <td style={td}>
                  <span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/transportadoras/editar/${item.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma transportadora cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
