import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from 'axios';
import { contasPagarService, type ContaPagar, type ContaPagarRequest } from '../services/contasPagarService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const API = 'http://localhost:8080/api';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const sel = { ...inputStyle, cursor: 'pointer' };

const EMPTY: ContaPagarRequest = { descricao: '', fornecedorId: null, valor: 0, dataVencimento: '', parcelaId: null, ativo: true };

const sitCfg: Record<string, { label: string; bg: string; color: string }> = {
  ABERTA:    { label: 'Aberta',    bg: '#FFF3CD', color: '#856404' },
  PAGA:      { label: 'Paga',      bg: '#D4EDDA', color: '#2D6A4F' },
  CANCELADA: { label: 'Cancelada', bg: '#F8D7DA', color: '#721C24' },
};

const aBtn = (bg: string, color: string, border?: string): CSSProperties => ({
  backgroundColor: bg, color, border: border ?? 'none', borderRadius: 6,
  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'Lato, sans-serif', marginRight: 4,
});

interface FornecedorOpt { id: number; fornecedor: string; }
interface ParcelaOpt    { id: number; numeroDias: number; }

export default function ContasPagar() {
  const [lista,        setLista]        = useState<ContaPagar[]>([]);
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState<ContaPagarRequest & { id?: number }>(EMPTY);
  const [erro,         setErro]         = useState('');
  const [fornecedores, setFornecedores] = useState<FornecedorOpt[]>([]);
  const [parcelas,     setParcelas]     = useState<ParcelaOpt[]>([]);
  const [modoVer,      setModoVer]      = useState(false);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await contasPagarService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar contas a pagar:', e); }
  };

  const carregarOpcoes = async () => {
    try {
      const [f, p] = await Promise.all([
        axios.get<FornecedorOpt[]>(`${API}/fornecedores`),
        axios.get<ParcelaOpt[]>(`${API}/parcelas`),
      ]);
      setFornecedores(f.data);
      setParcelas(p.data);
    } catch (e) { console.error('Erro ao carregar opções:', e); }
  };

  const abrirNovo = () => { carregarOpcoes(); setForm(EMPTY); setErro(''); setModoVer(false); setModal(true); };

  const abrirEditar = (item: ContaPagar, ver = false) => {
    carregarOpcoes();
    setForm({
      id: item.id, descricao: item.descricao,
      fornecedorId: item.fornecedor?.id ?? null,
      valor: item.valor, dataVencimento: item.dataVencimento,
      parcelaId: item.parcela?.id ?? null, ativo: item.ativo,
    });
    setErro(''); setModoVer(ver); setModal(true);
  };

  const salvar = async () => {
    if (!form.descricao.trim()) { setErro('Descrição é obrigatória.'); return; }
    if (!form.valor || form.valor <= 0) { setErro('Valor deve ser maior que zero.'); return; }
    if (!form.dataVencimento) { setErro('Data de vencimento é obrigatória.'); return; }
    try {
      form.id
        ? await contasPagarService.atualizar(form.id, form)
        : await contasPagarService.criar(form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const handlePagar = async (id: number) => {
    if (!confirm('Confirmar pagamento desta conta?')) return;
    try { await contasPagarService.pagar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao registrar pagamento.'); }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Cancelar esta conta a pagar?')) return;
    try { await contasPagarService.cancelar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao cancelar.'); }
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Excluir definitivamente esta conta?')) return;
    try { await contasPagarService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  const nomeForn = (f?: FornecedorOpt) => f?.fornecedor || '—';

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Contas a Pagar</h2>
          <p style={pageSubtitle}>Gerencie as contas a pagar do salão</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Conta a Pagar</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Descrição', 'Fornecedor', 'Valor (R$)', 'Vencimento', 'Situação'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 200 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(conta => {
              const sc = sitCfg[conta.situacao] ?? sitCfg.ABERTA;
              return (
                <tr key={conta.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...td, color: '#8B6E63' }}>{conta.id}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{conta.descricao}</td>
                  <td style={td}>{nomeForn(conta.fornecedor)}</td>
                  <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(conta.valor).toFixed(2)}</td>
                  <td style={td}>{conta.dataVencimento}</td>
                  <td style={td}>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={td}>
                    {conta.situacao === 'ABERTA' && (<>
                      <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => handlePagar(conta.id)}>Pagar</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => handleCancelar(conta.id)}>Cancelar</button>
                      <button style={{ ...btnEdit, marginRight: 0 }} onClick={() => abrirEditar(conta)}>Editar</button>
                    </>)}
                    {conta.situacao === 'PAGA' && (
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirEditar(conta, true)}>Ver</button>
                    )}
                    {conta.situacao === 'CANCELADA' && (
                      <button style={btnDelete} onClick={() => handleDeletar(conta.id)}>Excluir</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma conta a pagar cadastrada</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                {modoVer ? 'Detalhes da Conta' : (form.id ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar')}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>
            {erro && <p style={erroBanner}>{erro}</p>}

            <div style={g12}>
              <div style={{ gridColumn: 'span 12' }}>
                <label style={labelStyle}>Descrição *</label>
                <input style={inputStyle} placeholder="Descreva a conta a pagar..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Valor (R$) *</label>
                <input type="number" min={0} step={0.01} style={inputStyle} placeholder="0,00" value={form.valor || ''} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Data de Vencimento *</label>
                <input type="date" style={inputStyle} value={form.dataVencimento} onChange={e => setForm({ ...form, dataVencimento: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Fornecedor</label>
                <select style={sel} value={form.fornecedorId || ''} onChange={e => setForm({ ...form, fornecedorId: e.target.value ? Number(e.target.value) : null })} disabled={modoVer}>
                  <option value="">Selecione o fornecedor</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.fornecedor}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={labelStyle}>Parcela</label>
                <select style={sel} value={form.parcelaId || ''} onChange={e => setForm({ ...form, parcelaId: e.target.value ? Number(e.target.value) : null })} disabled={modoVer}>
                  <option value="">Selecione a parcela</option>
                  {parcelas.map(p => <option key={p.id} value={p.id}>Nº dias: {p.numeroDias}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-cp" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} disabled={modoVer} />
                <label htmlFor="ativo-cp" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {!modoVer && <button onClick={salvar} style={btnPrimary}>Salvar</button>}
              <button onClick={() => setModal(false)} style={btnCancel}>{modoVer ? 'Fechar' : 'Cancelar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
