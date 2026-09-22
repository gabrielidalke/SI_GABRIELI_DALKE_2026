import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fornecedorService } from '../services/fornecedorService';
import type { Fornecedor } from '../services/fornecedorService';
import { th, td, card, badge, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../styles/theme';

export default function Fornecedores() {
  const [lista, setLista] = useState<Fornecedor[]>([]);
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await fornecedorService.listar();
      setLista(r.data);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e);
      setLista([]);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir este fornecedor?')) return;
    try { await fornecedorService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Fornecedores</h2>
          <p style={pageSubtitle}>Gerencie os fornecedores do salão</p>
        </div>
        <button onClick={() => navigate('/fornecedores/novo')} style={btnNew}>+ Novo Fornecedor</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Fornecedor', 'CPF/CNPJ', 'Telefone', 'Cidade', 'Condição Pgto', 'Status'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>
                  {item.fornecedor}
                  {item.nomeFantasia && (
                    <span style={{ display: 'block', fontSize: 12, color: '#8B6E63', fontWeight: 400 }}>
                      {item.nomeFantasia}
                    </span>
                  )}
                </td>
                <td style={td}>{item.cpfCnpj || '—'}</td>
                <td style={td}>{item.fone || item.celular || '—'}</td>
                <td style={td}>
                  {item.cidade
                    ? `${item.cidade.nome}${item.cidade.estadoUf ? ` - ${item.cidade.estadoUf}` : ''}`
                    : '—'}
                </td>
                <td style={td}>{item.condicaoPagamento?.condicao || '—'}</td>
                <td style={td}>
                  <span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/fornecedores/editar/${item.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum fornecedor cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
