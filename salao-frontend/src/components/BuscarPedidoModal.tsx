import { useEffect, useState } from 'react';
import { pedidoCompraService, type PedidoCompra } from '../services/pedidoCompraService';
import { mensagemDeErro } from '../services/notaEntradaService';
import { th, td, modalOverlay, modalBox, btnCancel, btnPrimary, erroBanner } from '../styles/theme';

const dataBR = (iso: string) => iso.split('-').reverse().join('/');

interface Props {
  // Quando o fornecedor da nota já foi validado, só os pedidos dele aparecem
  fornecedorId?: number | null;
  onSelecionar: (pedido: PedidoCompra) => void;
  onClose: () => void;
}

// Lista os pedidos que ainda têm algo a receber (ABERTA e PARCIAL)
export default function BuscarPedidoModal({ fornecedorId, onSelecionar, onClose }: Props) {
  const [pedidos, setPedidos] = useState<PedidoCompra[] | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    pedidoCompraService.listar({ situacoes: ['ABERTA', 'PARCIAL'], fornecedorId })
      .then(r => setPedidos(r.data))
      .catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar os pedidos de compra.')); setPedidos([]); });
  }, [fornecedorId]);

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, maxWidth: 820, maxHeight: '85vh', overflowY: 'auto' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: '0 0 6px' }}>
          Buscar Pedido de Compra
        </h3>
        <p style={{ fontSize: 13, color: '#8B6E63', marginTop: 0, marginBottom: 20 }}>
          {fornecedorId
            ? 'Pedidos em aberto do fornecedor desta nota.'
            : 'Ao escolher um pedido, o fornecedor e os produtos ainda não recebidos são carregados na nota.'}
        </p>

        {erro && <p style={erroBanner}>{erro}</p>}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Modelo / Série / Número', 'Fornecedor', 'Data', 'Situação', 'Itens a receber', ''].map(h => (
                <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(pedidos ?? []).map(p => {
              const aReceber = p.itens.filter(i => i.quantidadeRecebida < i.quantidade).length;
              return (
                <tr key={`${p.modelo}-${p.serie}-${p.numero}-${p.fornecedor.id}`} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...td, fontWeight: 600 }}>{p.modelo} / {p.serie} / {p.numero}</td>
                  <td style={td}>{p.fornecedor.nome || `Fornecedor ${p.fornecedor.id}`}</td>
                  <td style={td}>{dataBR(p.dataPedido)}</td>
                  <td style={td}>{p.situacao === 'PARCIAL' ? 'Parcial' : 'Aberta'}</td>
                  <td style={td}>{aReceber} de {p.itens.length}</td>
                  <td style={td}>
                    <button type="button" style={{ ...btnPrimary, padding: '6px 16px', fontSize: 12 }} onClick={() => onSelecionar(p)}>
                      Selecionar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {pedidos !== null && pedidos.length === 0 && !erro && (
          <p style={{ textAlign: 'center', color: '#8B6E63', padding: 24 }}>Nenhum pedido de compra em aberto.</p>
        )}
        {pedidos === null && <p style={{ textAlign: 'center', color: '#8B6E63', padding: 24 }}>Carregando...</p>}

        <button type="button" onClick={onClose} style={btnCancel}>Fechar</button>
      </div>
    </div>
  );
}
