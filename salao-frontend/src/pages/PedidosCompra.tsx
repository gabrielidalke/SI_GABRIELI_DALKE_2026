import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoCompraService, type PedidoCompra, type SituacaoPedido } from '../services/pedidoCompraService';
import { mensagemDeErro } from '../services/notaEntradaService';
import { th, td, card, btnEdit, btnNew, pageTitle, pageSubtitle } from '../styles/theme';

const situacaoCfg: Record<SituacaoPedido, { label: string; bg: string; color: string }> = {
  ABERTA:    { label: 'Aberta',    bg: '#D1ECF1', color: '#0C5460' },
  PARCIAL:   { label: 'Parcial',   bg: '#FFF3CD', color: '#856404' },
  CONCLUIDA: { label: 'Concluída', bg: '#D4EDDA', color: '#2D6A4F' },
};

const aBtn = (bg: string, color: string): CSSProperties => ({
  backgroundColor: bg, color, border: 'none', borderRadius: 6,
  padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'Lato, sans-serif', marginRight: 4,
});

const dataBR = (iso: string) => iso.split('-').reverse().join('/');
const brl = (v: number) => `R$ ${Number(v).toFixed(2)}`;
const rota = (p: PedidoCompra) => `/pedidos-compra/${p.modelo}/${p.serie}/${p.numero}/${p.fornecedor.id}`;

export default function PedidosCompra() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<PedidoCompra[]>([]);
  const [erro, setErro] = useState('');

  const carregar = () => pedidoCompraService.listar()
    .then(r => setLista(r.data))
    .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os pedidos de compra.')));

  useEffect(() => {
    pedidoCompraService.listar()
      .then(r => setLista(r.data))
      .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os pedidos de compra.')));
  }, []);

  const excluir = async (p: PedidoCompra) => {
    if (!confirm(`Excluir o pedido ${p.numero}/${p.serie} (modelo ${p.modelo})?`)) return;
    try {
      await pedidoCompraService.excluir({ modelo: p.modelo, serie: p.serie, numero: p.numero, fornecedorId: p.fornecedor.id });
      setErro(''); carregar();
    } catch (e) { alert(mensagemDeErro(e, 'Erro ao excluir o pedido.')); }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={pageTitle}>Pedidos de Compra</h2>
          <p style={pageSubtitle}>Pedidos feitos aos fornecedores. A situação muda conforme as Notas de Entrada recebem os produtos</p>
        </div>
        <button onClick={() => navigate('/pedidos-compra/novo')} style={btnNew}>+ Novo Pedido de Compra</button>
      </div>

      {erro && <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{erro}</p>}

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Modelo / Série / Número', 'Fornecedor', 'Data', 'Valor Total', 'Recebimento', 'Situação'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, minWidth: 170 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(p => {
              const sc = situacaoCfg[p.situacao] ?? situacaoCfg.ABERTA;
              const completos = p.itens.filter(i => i.quantidadeRecebida >= i.quantidade).length;
              return (
                <tr key={`${p.modelo}-${p.serie}-${p.numero}-${p.fornecedor.id}`} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{p.modelo} / {p.serie} / {p.numero}</td>
                  <td style={td}>{p.fornecedor.nome || `Fornecedor ${p.fornecedor.id}`}</td>
                  <td style={td}>{dataBR(p.dataPedido)}</td>
                  <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>{brl(p.valorTotal)}</td>
                  <td style={td}>{completos} de {p.itens.length} itens completos</td>
                  <td style={td}>
                    <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={td}>
                    {p.situacao === 'ABERTA' ? (<>
                      <button style={{ ...btnEdit, marginRight: 4 }} onClick={() => navigate(rota(p))}>Editar</button>
                      <button style={aBtn('#F8D7DA', '#721C24')} onClick={() => excluir(p)}>Excluir</button>
                    </>) : (
                      <button style={aBtn('#FDF0E8', '#8B6E63')} onClick={() => navigate(rota(p))}>Ver</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18 }}>Nenhum pedido de compra cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
