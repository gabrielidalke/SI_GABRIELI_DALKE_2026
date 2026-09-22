import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { condicaoPagamentoService, type CondicaoPagamento } from '../services/condicaoPagamentoService';
import { parcelaService, type Parcela } from '../services/parcelaService';
import { th, td, card, btnNew, btnEdit, btnDelete, pageTitle, pageSubtitle } from '../styles/theme';

export default function CondicoesPagamento() {
  const [lista, setLista] = useState<CondicaoPagamento[]>([]);
  const [parcelasMap, setParcelasMap] = useState<Map<number, number>>(new Map());
  const navigate = useNavigate();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const [condRes, parcelasRes] = await Promise.all([
        condicaoPagamentoService.listar(),
        parcelaService.listar(),
      ]);
      setLista(condRes.data);

      const mapa = new Map<number, number>();
      (parcelasRes.data as Parcela[]).forEach(p => {
        const cid = p.condicaoPagamento?.id;
        if (cid) mapa.set(cid, (mapa.get(cid) ?? 0) + 1);
      });
      setParcelasMap(mapa);
    } catch (e) {
      console.error('Erro ao carregar condições de pagamento:', e);
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Deseja excluir esta condição de pagamento?')) return;
    try { await condicaoPagamentoService.deletar(id); carregar(); }
    catch (e: any) { alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao excluir.'); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Condições de Pagamento</h2>
          <p style={pageSubtitle}>Gerencie as condições de pagamento</p>
        </div>
        <button onClick={() => navigate('/condicoes-pagamento/nova')} style={btnNew}>+ Nova Condição</button>
      </div>

      <div style={card}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['ID', 'Condição', 'Multa (%)', 'Juros (%)', 'Desconto (%)', 'Nº Parcelas', 'Ações'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(item => (
              <tr key={item.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, color: '#8B6E63' }}>{item.id}</td>
                <td style={{ ...td, fontWeight: 500 }}>{item.condicao}</td>
                <td style={td}>{item.multa != null ? `${item.multa}%` : '—'}</td>
                <td style={td}>{item.juro != null ? `${item.juro}%` : '—'}</td>
                <td style={td}>{item.desconto != null ? `${item.desconto}%` : '—'}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{ display: 'inline-block', backgroundColor: '#FDF0E8', color: '#8B6E63', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                    {parcelasMap.get(item.id) ?? 0}
                  </span>
                </td>
                <td style={td}>
                  <button style={btnEdit} onClick={() => navigate(`/condicoes-pagamento/editar/${item.id}`)}>Editar</button>
                  <button style={btnDelete} onClick={() => deletar(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhuma condição cadastrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
