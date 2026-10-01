import { useEffect, useState } from 'react';
import { estoqueService, type MovimentacaoEstoque } from '../services/estoqueService';
import { th, td, card, pageTitle, pageSubtitle } from '../styles/theme';

const fmtData = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const origemLabel = (tipo?: string) => tipo === 'NOTA_ENTRADA' ? 'Nota de Entrada' : tipo === 'COMPRA' ? 'Compra' : tipo === 'VENDA' ? 'Venda' : (tipo || '—');

export default function EstoqueMovimentacoes() {
  const [lista, setLista] = useState<MovimentacaoEstoque[]>([]);

  useEffect(() => {
    estoqueService.listar()
      .then(r => setLista(r.data))
      .catch(e => console.error('Erro ao carregar movimentações de estoque:', e));
  }, []);

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Estoque</h2>
        <p style={pageSubtitle}>Histórico de entradas e saídas. A entrada só é registrada quando a Nota de Entrada é confirmada</p>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Produto', 'Tipo', 'Quantidade', 'Saldo Anterior', 'Saldo Posterior', 'Custo Unit.', 'Documento', 'Data'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(m => (
              <tr key={m.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, fontWeight: 500 }}>{m.produto?.nome || '—'}</td>
                <td style={td}>
                  <span style={{
                    backgroundColor: m.tipo === 'ENTRADA' ? '#D4EDDA' : '#F8D7DA',
                    color: m.tipo === 'ENTRADA' ? '#2D6A4F' : '#721C24',
                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    {m.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td style={td}>{m.quantidade}</td>
                <td style={td}>{m.saldoAnterior ?? '—'}</td>
                <td style={{ ...td, fontWeight: 600 }}>{m.saldoResultante}</td>
                <td style={td}>{m.custoUnitario != null ? `R$ ${Number(m.custoUnitario).toFixed(2)}` : '—'}</td>
                <td style={td}>{m.documento || `${origemLabel(m.origemTipo)}${m.origemId ? ` #${m.origemId}` : ''}`}</td>
                <td style={td}>{fmtData(m.criadoEm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma movimentação registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
