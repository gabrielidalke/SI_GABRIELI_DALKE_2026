import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { notaEntradaService, mensagemDeErro, caminhoTelaNota as caminhoNota, type NotaEntradaResumo, type SituacaoNota } from '../services/notaEntradaService';
import { th, td, card, btnEdit, btnNew, pageTitle, pageSubtitle } from '../styles/theme';

const situacaoCfg: Record<SituacaoNota, { label: string; bg: string; color: string }> = {
  PENDENTE:  { label: 'Pendente',  bg: '#FFF3CD', color: '#856404' },
  CONFERIDA: { label: 'Conferida', bg: '#D4EDDA', color: '#2D6A4F' },
};

const aBtn = (bg: string, color: string): CSSProperties => ({
  backgroundColor: bg, color, border: 'none', borderRadius: 6,
  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'Lato, sans-serif', marginRight: 4,
});

const dataBR = (iso?: string | null) => (iso ? iso.split('-').reverse().join('/') : '—');
const brl = (v: number) => `R$ ${Number(v).toFixed(2)}`;

export default function NotasEntrada() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<NotaEntradaResumo[]>([]);
  const [erro, setErro] = useState('');

  const carregar = () => notaEntradaService.listar()
    .then(r => setLista(r.data))
    .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar as notas de entrada.')));

  useEffect(() => {
    notaEntradaService.listar()
      .then(r => setLista(r.data))
      .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar as notas de entrada.')));
  }, []);

  const confirmar = async (n: NotaEntradaResumo) => {
    const texto = `Confirmar a nota ${n.numero}/${n.serie} (modelo ${n.modelo})?\n\n`
      + 'Isso dá entrada dos produtos no estoque e gera as contas a pagar.\n'
      + 'Depois de confirmada, a nota não poderá mais ser editada nem excluída.';
    if (!confirm(texto)) return;
    try { await notaEntradaService.confirmar(n); setErro(''); carregar(); }
    catch (e) { alert(mensagemDeErro(e, 'Erro ao confirmar a nota.')); }
  };

  const excluir = async (n: NotaEntradaResumo) => {
    if (!confirm(`Excluir a nota ${n.numero}/${n.serie} (modelo ${n.modelo})?`)) return;
    try { await notaEntradaService.excluir(n); setErro(''); carregar(); }
    catch (e) { alert(mensagemDeErro(e, 'Erro ao excluir a nota.')); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Notas de Entrada</h2>
          <p style={pageSubtitle}>Notas fiscais recebidas dos fornecedores. Ao confirmar, a nota dá entrada no estoque e gera as contas a pagar</p>
        </div>
        <button onClick={() => navigate('/notas-entrada/nova')} style={btnNew}>+ Nova Nota de Entrada</button>
      </div>

      {erro && <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{erro}</p>}

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Modelo / Série / Número', 'Fornecedor', 'Emissão', 'Chegada', 'Valor Total', 'Pedido', 'Situação'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 230 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(n => {
              const sc = situacaoCfg[n.situacao] ?? situacaoCfg.PENDENTE;
              return (
                <tr key={`${n.modelo}-${n.serie}-${n.numero}-${n.fornecedorId}`} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{n.modelo} / {n.serie} / {n.numero}</td>
                  <td style={td}>{n.fornecedorNome || `Fornecedor ${n.fornecedorId}`}</td>
                  <td style={td}>{dataBR(n.dataEmissao)}</td>
                  <td style={td}>{dataBR(n.dataChegada)}</td>
                  <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>{brl(n.valorTotal)}</td>
                  <td style={td}>{n.pedido ? `${n.pedido.modelo}/${n.pedido.serie}/${n.pedido.numero}` : '—'}</td>
                  <td style={td}>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={td}>
                    {n.situacao === 'PENDENTE' ? (<>
                      <button style={{ ...btnEdit, marginRight: 4 }} onClick={() => navigate(caminhoNota(n))}>Editar</button>
                      <button style={aBtn('#D4EDDA', '#2D6A4F')} onClick={() => confirmar(n)}>Confirmar</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => excluir(n)}>Excluir</button>
                    </>) : (
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => navigate(caminhoNota(n))}>Ver</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma nota de entrada cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
