import { useEffect, useState } from 'react';
import { classificacaoContaService, type ClassificacaoConta, type ClassificacaoContaRequest } from '../services/classificacaoContaService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, badge, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const EMPTY: ClassificacaoContaRequest = { nome: '', ativo: true };

export default function ClassificacoesConta() {
  const [lista, setLista] = useState<ClassificacaoConta[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ClassificacaoContaRequest & { id?: number }>(EMPTY);
  const [erro, setErro] = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await classificacaoContaService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar classificações da conta:', e); }
  };

  const abrirNovo = () => { setForm(EMPTY); setErro(''); setModal(true); };
  const abrirEditar = (item: ClassificacaoConta) => {
    setForm({ id: item.id, nome: item.nome, ativo: item.ativo });
    setErro(''); setModal(true);
  };

  const salvar = async () => {
    if (form.nome.trim().length < 3) { setErro('Nome da classificação deve ter pelo menos 3 letras.'); return; }
    try {
      const dto: ClassificacaoContaRequest = { nome: form.nome, ativo: form.ativo };
      form.id ? await classificacaoContaService.atualizar(form.id, dto) : await classificacaoContaService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta classificação da conta?')) return;
    try { await classificacaoContaService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Classificações de Conta</h2>
          <p style={pageSubtitle}>Gerencie as classificações contábeis usadas nos itens de compra</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Classificação</button>
      </div>

      <div style={card}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Classificação', 'Status', 'Ações'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.nome}</td>
                <td style={td}><span style={badge(item.ativo)}>{item.ativo ? 'Ativo' : 'Inativo'}</span></td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(item)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}><p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma classificação cadastrada</p></div>}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', marginBottom: 24, marginTop: 0 }}>{form.id ? 'Editar Classificação' : 'Nova Classificação'}</h3>
            {erro && <p style={erroBanner}>{erro}</p>}
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Classificação *</label>
                <input style={inputStyle} placeholder="Ex: Mercadoria para Revenda" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-classificacao" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
                <label htmlFor="ativo-classificacao" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setModal(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
