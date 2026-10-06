import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from 'axios';
import { contasPagarService, type ContaPagar, type ContaPagarRequest } from '../services/contasPagarService';
import BaixaContaModal from '../components/BaixaContaModal';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnDelete, btnNew, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const API = 'http://localhost:8080/api';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const sel = { ...inputStyle, cursor: 'pointer' };

// Valor fica como texto enquanto editado: guardar já como number faz o React reescrever
// o valor a cada tecla (o "." do decimal some assim que é digitado, "150.5" vira "150" na
// hora), e a única forma confiável de mudar o valor passa a ser a setinha.
interface FormLocal {
  id?: number;
  descricao: string;
  fornecedorId: number | null;
  valor: string;
  dataVencimento: string;
  parcelaId: number | null;
  ativo: boolean;
}

const EMPTY: FormLocal = { descricao: '', fornecedorId: null, valor: '', dataVencimento: '', parcelaId: null, ativo: true };

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
interface ParcelaOpt    { id: number; numeroParcela: number; diasVencimento: number; condicaoPagamento?: { id: number; condicao: string }; }

const brl = (v?: number) => `R$ ${Number(v ?? 0).toFixed(2)}`;
const sub: CSSProperties = { display: 'block', fontSize: 11, color: '#8B6E63', fontWeight: 400, marginTop: 2 };

export default function ContasPagar() {
  const [lista,        setLista]        = useState<ContaPagar[]>([]);
  const [modal,        setModal]        = useState(false);
  const [form,         setForm]         = useState<FormLocal>(EMPTY);
  const [erro,         setErro]         = useState('');
  const [fornecedores, setFornecedores] = useState<FornecedorOpt[]>([]);
  const [parcelas,     setParcelas]     = useState<ParcelaOpt[]>([]);
  const [modoVer,      setModoVer]      = useState(false);
  const [contaVer,     setContaVer]     = useState<ContaPagar | null>(null);
  const [baixa,        setBaixa]        = useState<ContaPagar | null>(null);

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
      valor: String(item.valor), dataVencimento: item.dataVencimento,
      parcelaId: item.parcela?.id ?? null, ativo: item.ativo,
    });
    setContaVer(ver ? item : null);
    setErro(''); setModoVer(ver); setModal(true);
  };

  const salvar = async () => {
    if (!form.descricao.trim()) { setErro('Descrição é obrigatória.'); return; }
    if (!form.valor || Number(form.valor) <= 0) { setErro('Valor deve ser maior que zero.'); return; }
    if (!form.dataVencimento) { setErro('Data de vencimento é obrigatória.'); return; }
    if (!form.fornecedorId) { setErro('Fornecedor é obrigatório.'); return; }
    const dto: ContaPagarRequest = {
      descricao: form.descricao,
      fornecedorId: form.fornecedorId,
      valor: Number(form.valor),
      dataVencimento: form.dataVencimento,
      parcelaId: form.parcelaId,
      ativo: form.ativo,
    };
    try {
      form.id
        ? await contasPagarService.atualizar(form.id, dto)
        : await contasPagarService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
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
              {['ID', 'Descrição', 'Fornecedor', 'Valor (R$)', 'Vencimento', 'Pago (R$)', 'Situação'].map(h => (
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
                  <td style={{ ...td, fontWeight: 500 }}>
                    {conta.descricao}
                    {conta.nota && <span style={sub}>Nota de Entrada {conta.nota.numero}/{conta.nota.serie} (mod. {conta.nota.modelo})</span>}
                  </td>
                  <td style={td}>{nomeForn(conta.fornecedor)}</td>
                  <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>
                    {brl(conta.valor)}
                    {conta.situacao === 'ABERTA' && conta.percentualDesconto > 0 && (
                      <span style={sub}>{brl(conta.valorComDesconto)} até o venc.</span>
                    )}
                  </td>
                  <td style={td}>{conta.dataVencimento}</td>
                  <td style={{ ...td, fontWeight: 600 }}>
                    {conta.situacao === 'PAGA' ? (<>
                      {brl(conta.valorPago)}
                      <span style={sub}>em {conta.dataPagamento}</span>
                    </>) : '—'}
                  </td>
                  <td style={td}>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={td}>
                    {conta.situacao === 'ABERTA' && (<>
                      <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => setBaixa(conta)}>Pagar</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => handleCancelar(conta.id)}>Cancelar</button>
                      {!conta.nota && <button style={{ ...btnEdit, marginRight: 0 }} onClick={() => abrirEditar(conta)}>Editar</button>}
                    </>)}
                    {conta.situacao === 'PAGA' && (
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirEditar(conta, true)}>Ver</button>
                    )}
                    {conta.situacao === 'CANCELADA' && !conta.nota && (
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
                <input type="number" min={0} step={0.01} style={inputStyle} placeholder="0,00" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Data de Vencimento *</label>
                <input type="date" style={inputStyle} value={form.dataVencimento} onChange={e => setForm({ ...form, dataVencimento: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Fornecedor *</label>
                <select style={sel} value={form.fornecedorId || ''} onChange={e => setForm({ ...form, fornecedorId: e.target.value ? Number(e.target.value) : null })} disabled={modoVer}>
                  <option value="">Selecione o fornecedor</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.fornecedor}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 6' }}>
                <label style={labelStyle}>Parcela</label>
                <select style={sel} value={form.parcelaId || ''} onChange={e => setForm({ ...form, parcelaId: e.target.value ? Number(e.target.value) : null })} disabled={modoVer}>
                  <option value="">Selecione a parcela</option>
                  {parcelas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.condicaoPagamento?.condicao ?? 'Sem condição'} — parcela {p.numeroParcela} ({p.diasVencimento} dias)
                    </option>
                  ))}
                </select>
              </div>
              {!modoVer && (
                <p style={{ gridColumn: 'span 12', fontSize: 12, color: '#8B6E63', margin: 0 }}>
                  Ao escolher a parcela, a conta herda o desconto, a multa e o juro da condição de pagamento dela.
                </p>
              )}
              <div style={{ gridColumn: 'span 12', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="ativo-cp" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} disabled={modoVer} />
                <label htmlFor="ativo-cp" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
              </div>
            </div>

            {modoVer && contaVer?.situacao === 'PAGA' && (
              <div style={{ backgroundColor: '#FDF6F0', borderRadius: 10, padding: '14px 18px', marginBottom: 16, fontSize: 14, color: '#3D2B1F' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Pagamento em {contaVer.dataPagamento}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 4 }}>
                  <span>Valor da conta</span><span>{brl(contaVer.valor)}</span>
                  <span>(−) Desconto {contaVer.percentualDesconto}%</span><span>− {brl(contaVer.valorDesconto)}</span>
                  <span>(+) Multa {contaVer.percentualMulta}%</span><span>+ {brl(contaVer.valorMulta)}</span>
                  <span>(+) Juro {contaVer.percentualJuro}% ao mês</span><span>+ {brl(contaVer.valorJuro)}</span>
                  <strong>Valor pago</strong><strong style={{ color: '#C97B6B' }}>{brl(contaVer.valorPago)}</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {!modoVer && <button onClick={salvar} style={btnPrimary}>Salvar</button>}
              <button onClick={() => setModal(false)} style={btnCancel}>{modoVer ? 'Fechar' : 'Cancelar'}</button>
            </div>
          </div>
        </div>
      )}

      {baixa && (
        <BaixaContaModal
          tipo="pagamento"
          descricao={baixa.descricao}
          calcular={data => contasPagarService.calcularBaixa(baixa.id, data).then(r => r.data)}
          confirmar={data => contasPagarService.pagar(baixa.id, data)}
          onClose={() => setBaixa(null)}
          onConcluido={() => { setBaixa(null); carregar(); }}
        />
      )}
    </div>
  );
}
