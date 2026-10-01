import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import axios from 'axios';
import type { CalculoBaixa } from '../services/contasPagarService';
import { inputStyle, labelStyle, modalOverlay, modalBox, btnPrimary, btnCancel, erroBanner } from '../styles/theme';

// Data local (toISOString é UTC: à noite no Brasil já seria "amanhã" e o backend recusaria como futura)
function hoje() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function mensagemErro(e: unknown, padrao: string) {
  if (axios.isAxiosError<{ mensagem?: string; message?: string }>(e))
    return e.response?.data?.mensagem || e.response?.data?.message || padrao;
  return padrao;
}

const brl = (v: number) => `R$ ${Number(v).toFixed(2)}`;
const dataBR = (iso: string) => iso.split('-').reverse().join('/');

const linha: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid #F0E6DC', fontSize: 14, color: '#3D2B1F' };
const nota: CSSProperties = { fontSize: 11, color: '#8B6E63', marginLeft: 6 };

interface Props {
  tipo: 'pagamento' | 'recebimento';
  descricao: string;
  calcular: (data: string) => Promise<CalculoBaixa>;
  confirmar: (data: string) => Promise<unknown>;
  onClose: () => void;
  onConcluido: () => void;
}

export default function BaixaContaModal({ tipo, descricao, calcular, confirmar, onClose, onConcluido }: Props) {
  const [data, setData] = useState(hoje());
  const [calculo, setCalculo] = useState<CalculoBaixa | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const pagamento = tipo === 'pagamento';

  useEffect(() => {
    if (!data) { setCalculo(null); return; }
    let ativo = true;
    setErro('');
    calcular(data)
      .then(c => { if (ativo) setCalculo(c); })
      .catch((e: unknown) => {
        if (!ativo) return;
        setCalculo(null);
        setErro(mensagemErro(e, 'Erro ao calcular.'));
      });
    return () => { ativo = false; };
    // calcular muda a cada render do pai; só a data dispara um novo cálculo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleConfirmar = async () => {
    if (!calculo) return;
    setSalvando(true);
    try {
      await confirmar(data);
      onConcluido();
    } catch (e: unknown) {
      setErro(mensagemErro(e, `Erro ao registrar ${tipo}.`));
    } finally {
      setSalvando(false);
    }
  };

  const atrasado = calculo ? calculo.diasAtraso > 0 : false;

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: 0 }}>
            {pagamento ? 'Registrar Pagamento' : 'Registrar Recebimento'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#8B6E63', lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: '#8B6E63', marginTop: 0, marginBottom: 20 }}>{descricao}</p>

        {erro && <p style={erroBanner}>{erro}</p>}

        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>{pagamento ? 'Data do Pagamento *' : 'Data do Recebimento *'}</label>
          <input type="date" style={inputStyle} value={data} max={hoje()} onChange={e => setData(e.target.value)} />
        </div>

        {calculo && (
          <div style={{ marginBottom: 24 }}>
            <div style={linha}>
              <span>Valor da conta</span>
              <span>{brl(calculo.valor)}</span>
            </div>
            <div style={linha}>
              <span>Vencimento</span>
              <span>
                {dataBR(calculo.dataVencimento)}
                <span style={{ ...nota, color: atrasado ? '#721C24' : '#2D6A4F', fontWeight: 700 }}>
                  {atrasado ? `${calculo.diasAtraso} dia(s) de atraso` : 'em dia'}
                </span>
              </span>
            </div>
            <div style={linha}>
              <span>(−) Desconto {calculo.percentualDesconto}%<span style={nota}>até o vencimento</span></span>
              <span style={{ color: '#2D6A4F' }}>− {brl(calculo.valorDesconto)}</span>
            </div>
            <div style={linha}>
              <span>(+) Multa {calculo.percentualMulta}%<span style={nota}>após o vencimento</span></span>
              <span style={{ color: '#721C24' }}>+ {brl(calculo.valorMulta)}</span>
            </div>
            <div style={linha}>
              <span>(+) Juro {calculo.percentualJuro}% ao mês<span style={nota}>{calculo.diasAtraso} dia(s)</span></span>
              <span style={{ color: '#721C24' }}>+ {brl(calculo.valorJuro)}</span>
            </div>
            <div style={{ ...linha, borderBottom: 'none', fontSize: 16, fontWeight: 700, paddingTop: 12 }}>
              <span>{pagamento ? 'Total a pagar' : 'Total a receber'}</span>
              <span style={{ color: '#C97B6B' }}>{brl(calculo.valorFinal)}</span>
            </div>
            {atrasado && calculo.percentualDesconto > 0 && (
              <p style={{ fontSize: 12, color: '#856404', backgroundColor: '#FFF3CD', padding: '8px 12px', borderRadius: 8, margin: '8px 0 0' }}>
                O desconto de {calculo.percentualDesconto}% só vale até o vencimento.
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handleConfirmar} disabled={!calculo || salvando}
            style={{ ...btnPrimary, opacity: !calculo || salvando ? 0.6 : 1, cursor: !calculo || salvando ? 'not-allowed' : 'pointer' }}>
            {salvando ? 'Salvando...' : (pagamento ? 'Confirmar Pagamento' : 'Confirmar Recebimento')}
          </button>
          <button onClick={onClose} style={btnCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
