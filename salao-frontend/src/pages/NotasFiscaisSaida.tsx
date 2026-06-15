import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { notaFiscalSaidaService, type NotaFiscalSaida, type TransporteRequest } from '../services/notaFiscalSaidaService';
import { th, td, inputStyle, labelStyle, card, modalOverlay, modalBox, btnPrimary, btnCancel, btnEdit, pageTitle, pageSubtitle, erroBanner } from '../styles/theme';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };
const EMPTY: TransporteRequest = { transportadoraNome: '', veiculoPlaca: '' };

const fmtData = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

export default function NotasFiscaisSaida() {
  const [lista,  setLista]  = useState<NotaFiscalSaida[]>([]);
  const [modal,  setModal]  = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form,   setForm]   = useState<TransporteRequest>(EMPTY);
  const [erro,   setErro]   = useState('');

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try { const r = await notaFiscalSaidaService.listar(); setLista(r.data); }
    catch (e) { console.error('Erro ao carregar notas fiscais de saída:', e); }
  };

  const abrirEditar = (nf: NotaFiscalSaida) => {
    setForm({ transportadoraNome: nf.transportadoraNome || '', veiculoPlaca: nf.veiculoPlaca || '' });
    setErro(''); setEditId(nf.id); setModal(true);
  };

  const salvar = async () => {
    if (!editId) return;
    try {
      await notaFiscalSaidaService.atualizarTransporte(editId, form);
      setModal(false); carregar();
    } catch (e: any) { setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Notas Fiscais de Saída</h2>
        <p style={pageSubtitle}>Notas geradas automaticamente a partir das vendas validadas</p>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Nº Nota', 'Série', 'Data Emissão', 'Cliente', 'Valor Total (R$)', 'Transportadora', 'Placa'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 160 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(nf => (
              <tr key={nf.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, fontWeight: 600 }}>{nf.numeroNota}</td>
                <td style={td}>{nf.serie || '—'}</td>
                <td style={td}>{fmtData(nf.dataEmissao)}</td>
                <td style={td}>{nf.cliente?.nome || '—'}</td>
                <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(nf.valorTotal).toFixed(2)}</td>
                <td style={td}>{nf.transportadoraNome || '—'}</td>
                <td style={td}>{nf.veiculoPlaca || '—'}</td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => abrirEditar(nf)}>Editar Transporte</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma nota fiscal de saída cadastrada</p>
            <p style={{ fontSize: 13, color: '#8B6E63', marginTop: 8 }}>Gere NF-e a partir de uma venda validada em <strong>Vendas → Gerar NF-e</strong></p>
          </div>
        )}
      </div>

      {modal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                Editar Transporte
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>
            {erro && <p style={erroBanner}>{erro}</p>}

            <div style={g12}>
              <div style={{ gridColumn: 'span 8' }}>
                <label style={labelStyle}>Transportadora</label>
                <input
                  style={inputStyle}
                  placeholder="Nome da transportadora..."
                  value={form.transportadoraNome || ''}
                  onChange={e => setForm({ ...form, transportadoraNome: e.target.value })}
                />
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                <label style={labelStyle}>Placa do Veículo</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: ABC-1234"
                  value={form.veiculoPlaca || ''}
                  onChange={e => setForm({ ...form, veiculoPlaca: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={salvar} style={btnPrimary}>Salvar</button>
              <button onClick={() => setModal(false)} style={btnCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
