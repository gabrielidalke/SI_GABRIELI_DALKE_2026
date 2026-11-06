import { useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { inputStyle } from '../styles/theme';

interface Props {
  value: string;               // data ISO (aaaa-mm-dd) ou '' — é o que o formulário guarda
  onChange: (iso: string) => void;
  min?: string;                // ISO; só limita o calendário (as mensagens de regra ficam no formulário)
  max?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

const isoParaBR = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('/') : '');

// "dd/mm/aaaa" -> ISO, só se a data existir de verdade (31/02 ou 29/02 fora de ano bissexto não passam)
const brParaIso = (texto: string): string | null => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [, dd, mm, aaaa] = m;
  const d = new Date(Number(aaaa), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(aaaa) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) return null;
  return `${aaaa}-${mm}-${dd}`;
};

// Só dígitos, com as barras colocadas sozinhas: 01102026 -> 01/10/2026
const mascara = (texto: string) => {
  const n = texto.replace(/\D/g, '').slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
};

// Campo de data sempre no padrão brasileiro dd/mm/aaaa: o <input type="date"> segue o idioma do
// navegador/Windows (em inglês mostra mm/dd/yyyy). Dá para digitar ou abrir o calendário no 📅.
export default function CampoData({ value, onChange, min, max, disabled, style }: Props) {
  const calendario = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState(isoParaBR(value));
  const [valorAnterior, setValorAnterior] = useState(value);

  // a data mudou por fora (carregou a nota, escolheu no calendário): mostra a nova
  if (value !== valorAnterior) {
    setValorAnterior(value);
    setTexto(isoParaBR(value));
  }

  const digitado = (bruto: string) => {
    const t = mascara(bruto);
    setTexto(t);
    if (t === '') { setValorAnterior(''); onChange(''); return; }
    const iso = brParaIso(t);
    if (iso) { setValorAnterior(iso); onChange(iso); }
  };

  const abrirCalendario = () => {
    const el = calendario.current;
    if (disabled || !el) return;
    if (typeof el.showPicker === 'function') el.showPicker();
    else { el.focus(); el.click(); }
  };

  const incompleto = texto !== '' && brParaIso(texto) === null;

  return (
    <div style={{ position: 'relative', ...style }}>
      <input
        type="text" inputMode="numeric" placeholder="dd/mm/aaaa" maxLength={10}
        value={texto} disabled={disabled}
        onChange={e => digitado(e.target.value)}
        // saiu do campo com a data pela metade: volta para a última data válida
        onBlur={() => { if (incompleto) setTexto(isoParaBR(value)); }}
        style={{ ...inputStyle, paddingRight: 40, borderColor: incompleto ? '#E57373' : '#E8D5CC' }}
      />
      <button type="button" onClick={abrirCalendario} disabled={disabled} title="Abrir calendário" aria-label="Abrir calendário"
        style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 16, padding: 4, opacity: disabled ? 0.4 : 1,
        }}>
        📅
      </button>
      {/* calendário nativo escondido: só a janelinha de escolher a data aparece */}
      <input ref={calendario} type="date" tabIndex={-1} aria-hidden="true" value={value} min={min} max={max} disabled={disabled}
        onChange={e => { setValorAnterior(e.target.value); setTexto(isoParaBR(e.target.value)); onChange(e.target.value); }}
        style={{ position: 'absolute', right: 6, bottom: 0, width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 'none', padding: 0 }}
      />
      {incompleto && <p style={{ fontSize: 11, color: '#721C24', margin: '4px 0 0' }}>Data inválida (use dd/mm/aaaa).</p>}
    </div>
  );
}
