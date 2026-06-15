import { useEffect, useState } from 'react';
import { notaFiscalServicoService, type NotaFiscalServico } from '../services/notaFiscalServicoService';
import { th, td, card, modalOverlay, modalBox, btnCancel, pageTitle, pageSubtitle } from '../styles/theme';

const fmtData = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
};

const nomesServicos = (nf: NotaFiscalServico): string => {
  const lista = nf.servicos?.length
    ? nf.servicos
    : nf.agendamento?.servicos;
  return lista?.map(s => s.nome).join(', ') || '—';
};

const btnVer = {
  backgroundColor: '#FDF0E8', color: '#8B6E63', border: 'none',
  borderRadius: 6, padding: '5px 14px', cursor: 'pointer',
  fontSize: 12, fontWeight: 600, fontFamily: 'Lato, sans-serif',
} as React.CSSProperties;

export default function NotasFiscaisServico() {
  const [lista,  setLista]  = useState<NotaFiscalServico[]>([]);
  const [modal,  setModal]  = useState(false);
  const [detalhe, setDetalhe] = useState<NotaFiscalServico | null>(null);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const r = await notaFiscalServicoService.listar();
      if (r.data.length > 0) console.log('[NFS-e] estrutura do primeiro item:', r.data[0]);
      setLista(r.data);
    } catch (e) { console.error('Erro ao carregar NFS-e:', e); }
  };

  const abrirVer = async (nf: NotaFiscalServico) => {
    try {
      const r = await notaFiscalServicoService.buscarPorId(nf.id);
      setDetalhe(r.data);
    } catch {
      setDetalhe(nf);
    }
    setModal(true);
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Notas Fiscais de Serviço</h2>
        <p style={pageSubtitle}>NFS-e geradas a partir de agendamentos concluídos</p>
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <table className="salon-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Nº Nota', 'Data Emissão', 'Cliente', 'Serviços', 'Valor Total (R$)'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
              <th style={{ ...th, width: 90 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(nf => (
              <tr key={nf.id} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ ...td, fontWeight: 600 }}>{nf.numeroNota}</td>
                <td style={td}>{fmtData(nf.dataEmissao)}</td>
                <td style={td}>{nf.cliente?.nome || '—'}</td>
                <td style={{ ...td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nomesServicos(nf)}
                </td>
                <td style={{ ...td, color: '#C97B6B', fontWeight: 600 }}>R$ {Number(nf.valorTotal).toFixed(2)}</td>
                <td style={td}>
                  <button style={btnVer} onClick={() => abrirVer(nf)}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#8B6E63' }}>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#3D2B1F' }}>Nenhuma NFS-e emitida</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Gere NFS-e a partir de agendamentos concluídos em <strong>Agendamentos → Gerar NFS-e</strong></p>
          </div>
        )}
      </div>

      {modal && detalhe && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
                Detalhes da NFS-e
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Row label="Nº Nota"      value={detalhe.numeroNota} />
              <Row label="Data Emissão" value={fmtData(detalhe.dataEmissao)} />
              <Row label="Cliente"      value={detalhe.cliente?.nome || '—'} />
              <Row label="Serviços"     value={nomesServicos(detalhe)} />
              <div style={{ borderTop: '1px solid #F0E6DC', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#8B6E63', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Valor Total</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#C97B6B', fontWeight: 700 }}>R$ {Number(detalhe.valorTotal).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button onClick={() => setModal(false)} style={btnCancel}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <span style={{ fontSize: 13, color: '#8B6E63', fontFamily: 'Lato, sans-serif', minWidth: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#3D2B1F', fontFamily: 'Lato, sans-serif', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
