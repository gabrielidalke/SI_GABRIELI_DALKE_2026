import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import axios from 'axios';
import { compraService, type Compra, type CompraRequest } from '../services/compraService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, btnNew, pageTitle, pageSubtitle, erroBanner, sectionTitle } from '../styles/theme';

const API = 'http://localhost:8080/api';
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const sel = { ...inputStyle, cursor: 'pointer' };

const statusCfg: Record<string, { label: string; bg: string; color: string }> = {
  RASCUNHO:   { label: 'Rascunho',    bg: '#E8E8E8', color: '#555555' },
  VALIDADA:   { label: 'Validada',    bg: '#D1ECF1', color: '#0C5460' },
  NFE_GERADA: { label: 'NF-e Gerada', bg: '#D4EDDA', color: '#2D6A4F' },
  CANCELADA:  { label: 'Cancelada',   bg: '#F8D7DA', color: '#721C24' },
};

const aBtn = (bg: string, color: string): CSSProperties => ({
  backgroundColor: bg, color, border: 'none', borderRadius: 6,
  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'Lato, sans-serif', marginRight: 4,
});

interface FornecedorOpt { id: number; fornecedor: string; }
interface ProdutoOpt    { id: number; nome: string; preco: number; }

interface ItemLocal {
  _key: number;
  produtoId: number | '';
  quantidade: number;
  precoUnitario: number;
}

const EMPTY_FORM = { numeroCompra: '', dataCompra: '', fornecedorId: '' as number | '', observacao: '' };

export default function Compras() {
  const navigate = useNavigate();
  const keyRef = useRef(0);
  const nextKey = () => ++keyRef.current;
  const emptyItem = (): ItemLocal => ({ _key: nextKey(), produtoId: '', quantidade: 1, precoUnitario: 0 });

  const [lista,        setLista]        = useState<Compra[]>([]);
  const [modal,        setModal]        = useState(false);
  const [modoVer,      setModoVer]      = useState(false);
  const [editId,       setEditId]       = useState<number | null>(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [itens,        setItens]        = useState<ItemLocal[]>([]);
  const [erro,         setErro]         = useState('');
  const [fornecedores, setFornecedores] = useState<FornecedorOpt[]>([]);
  const [produtos,     setProdutos]     = useState<ProdutoOpt[]>([]);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await compraService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar compras:', e); }
  };

  const carregarOpcoes = async () => {
    try {
      const [f, p] = await Promise.all([
        axios.get<FornecedorOpt[]>(`${API}/fornecedores`),
        axios.get<ProdutoOpt[]>(`${API}/produtos`),
      ]);
      setFornecedores(f.data);
      setProdutos(p.data);
    } catch (e) { console.error('Erro ao carregar opções:', e); }
  };

  const abrirNovo = () => {
    carregarOpcoes();
    setForm(EMPTY_FORM);
    setItens([emptyItem()]);
    setErro(''); setModoVer(false); setEditId(null); setModal(true);
  };

  const abrirVer = async (compra: Compra, ver = false) => {
    carregarOpcoes();
    setForm({
      numeroCompra: compra.numeroCompra,
      dataCompra:   compra.dataCompra,
      fornecedorId: compra.fornecedor?.id ?? '',
      observacao:   compra.observacao || '',
    });
    setItens(
      (compra.itens || []).map(i => ({
        _key:          nextKey(),
        produtoId:     i.produto?.id ?? i.produtoId ?? '',
        quantidade:    i.quantidade,
        precoUnitario: i.precoUnitario,
      }))
    );
    setErro(''); setModoVer(ver); setEditId(compra.id); setModal(true);
  };

  const addItem = () => setItens(prev => [...prev, emptyItem()]);
  const removeItem = (key: number) => setItens(prev => prev.filter(i => i._key !== key));

  const updateItem = (key: number, updates: Partial<Omit<ItemLocal, '_key'>>) => {
    setItens(prev => prev.map(i => {
      if (i._key !== key) return i;
      const next = { ...i, ...updates };
      if ('produtoId' in updates && updates.produtoId && i.precoUnitario === 0) {
        const prod = produtos.find(p => p.id === Number(updates.produtoId));
        if (prod) next.precoUnitario = prod.preco;
      }
      return next;
    }));
  };

  const total = itens.reduce((s, i) => s + (i.quantidade || 0) * (i.precoUnitario || 0), 0);

  const salvar = async () => {
    if (!form.numeroCompra.trim()) { setErro('Nº Compra é obrigatório.'); return; }
    if (!form.dataCompra)          { setErro('Data é obrigatória.'); return; }
    if (itens.length === 0)        { setErro('Adicione pelo menos um item.'); return; }
    if (itens.some(i => !i.produtoId)) { setErro('Selecione o produto em todos os itens.'); return; }
    const dto: CompraRequest = {
      numeroCompra: form.numeroCompra,
      dataCompra:   form.dataCompra,
      fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : null,
      observacao:   form.observacao,
      itens: itens.map(i => ({
        produtoId:     Number(i.produtoId),
        quantidade:    i.quantidade,
        precoUnitario: i.precoUnitario,
      })),
    };
    try {
      editId
        ? await compraService.atualizar(editId, dto)
        : await compraService.criar(dto);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  const handleValidar = async (id: number) => {
    if (!confirm('Validar esta compra?')) return;
    try { await compraService.validar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao validar.'); }
  };

  const handleGerarNfe = async (id: number) => {
    if (!confirm('Gerar NF-e para esta compra?')) return;
    try { await compraService.gerarNfe(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao gerar NF-e.'); }
  };

  const handleCancelar = async (id: number) => {
    if (!confirm('Cancelar esta compra?')) return;
    try { await compraService.cancelar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao cancelar.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Compras</h2>
          <p style={pageSubtitle}>Gerencie as compras do salão</p>
        </div>
        <button onClick={abrirNovo} style={btnNew}>+ Nova Compra</button>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Nº Compra', 'Data', 'Fornecedor', 'Valor Total (R$)', 'Status'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 230 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(compra => {
              const sc = statusCfg[compra.status] ?? statusCfg.RASCUNHO;
              return (
                <tr key={compra.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{compra.numeroCompra}</td>
                  <td style={td}>{compra.dataCompra}</td>
                  <td style={td}>{compra.fornecedor?.fornecedor || '—'}</td>
                  <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(compra.valorTotal).toFixed(2)}</td>
                  <td style={td}>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={td}>
                    {compra.status === 'RASCUNHO' && (<>
                      <button style={{ ...btnEdit, marginRight: 4 }} onClick={() => abrirVer(compra)}>Editar</button>
                      <button style={aBtn('#D1ECF1', '#0C5460')} onClick={() => handleValidar(compra.id)}>Validar</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => handleCancelar(compra.id)}>Cancelar</button>
                    </>)}
                    {compra.status === 'VALIDADA' && (<>
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirVer(compra, true)}>Ver</button>
                      <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => handleGerarNfe(compra.id)}>Gerar NF-e</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => handleCancelar(compra.id)}>Cancelar</button>
                    </>)}
                    {compra.status === 'NFE_GERADA' && (<>
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirVer(compra, true)}>Ver</button>
                      <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => navigate('/notas-fiscais-entrada')}>Ver NF-e</button>
                    </>)}
                    {compra.status === 'CANCELADA' && (
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => abrirVer(compra, true)}>Ver</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma compra cadastrada</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 900, width: '94%', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                {modoVer ? 'Detalhes da Compra' : (editId ? 'Editar Compra' : 'Nova Compra')}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>
            {erro && <p style={erroBanner}>{erro}</p>}

            <div style={g12}>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Nº Compra *</label>
                <input style={inputStyle} placeholder="Ex: C-2024-001" value={form.numeroCompra} onChange={e => setForm({ ...form, numeroCompra: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Data *</label>
                <input type="date" style={inputStyle} value={form.dataCompra} onChange={e => setForm({ ...form, dataCompra: e.target.value })} disabled={modoVer} />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Fornecedor</label>
                <select style={sel} value={form.fornecedorId} onChange={e => setForm({ ...form, fornecedorId: e.target.value ? Number(e.target.value) : '' })} disabled={modoVer}>
                  <option value="">Selecione o fornecedor</option>
                  {fornecedores.map(f => <option key={f.id} value={f.id}>{f.fornecedor}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 12' }}>
                <label style={labelStyle}>Observação</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 56, resize: 'vertical' }}
                  placeholder="Observações sobre a compra..."
                  value={form.observacao}
                  onChange={e => setForm({ ...form, observacao: e.target.value })}
                  disabled={modoVer}
                />
              </div>
            </div>

            {/* Itens */}
            <p style={{ ...sectionTitle, marginTop: 4 }}>Itens da Compra</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#FDF0E8' }}>
                  {['Produto', 'Quantidade', 'Preço Unit. (R$)', 'Subtotal'].map(h => (
                    <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>
                  ))}
                  {!modoVer && <th style={{ ...th, padding: '8px 12px', width: 36 }} />}
                </tr>
              </thead>
              <tbody>
                {itens.map(item => {
                  const sub = (item.quantidade || 0) * (item.precoUnitario || 0);
                  return (
                    <tr key={item._key} style={{ borderTop: '1px solid #F0E6DC' }}>
                      <td style={{ padding: '8px 10px' }}>
                        <select
                          style={{ ...sel, fontSize: 13, padding: '7px 10px' }}
                          value={item.produtoId}
                          onChange={e => updateItem(item._key, { produtoId: e.target.value ? Number(e.target.value) : '' })}
                          disabled={modoVer}
                        >
                          <option value="">Selecione</option>
                          {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="number" min={1} step={1}
                          style={{ ...inputStyle, fontSize: 13, padding: '7px 10px' }}
                          value={item.quantidade}
                          onChange={e => updateItem(item._key, { quantidade: Number(e.target.value) })}
                          disabled={modoVer}
                        />
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <input
                          type="number" min={0} step={0.01}
                          style={{ ...inputStyle, fontSize: 13, padding: '7px 10px' }}
                          value={item.precoUnitario || ''}
                          onChange={e => updateItem(item._key, { precoUnitario: Number(e.target.value) })}
                          disabled={modoVer}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#C97B6B', whiteSpace: 'nowrap', fontSize: 14 }}>
                        R$ {sub.toFixed(2)}
                      </td>
                      {!modoVer && (
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                          <button
                            onClick={() => removeItem(item._key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C97B6B', fontSize: 18, lineHeight: 1 }}
                          >✕</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!modoVer && (
              <button
                onClick={addItem}
                style={{ backgroundColor: 'transparent', border: '1px dashed #C97B6B', color: '#C97B6B', borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 20 }}
              >
                + Adicionar Item
              </button>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <div style={{ backgroundColor: '#FDF0E8', padding: '12px 28px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#8B6E63', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Total Geral</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#C97B6B', fontWeight: 700 }}>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {!modoVer && <button onClick={salvar} style={btnPrimary}>Salvar</button>}
              <button onClick={() => setModal(false)} style={btnCancel}>{modoVer ? 'Fechar' : 'Cancelar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
