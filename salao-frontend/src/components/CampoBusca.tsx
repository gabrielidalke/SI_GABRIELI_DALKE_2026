import { inputStyle } from '../styles/theme';

interface Props {
  valor: string; // texto já formatado ("#3 — Distribuidora ..."); vazio = nada escolhido
  placeholder?: string;
  disabled?: boolean;
  onBuscar: () => void;
  onLimpar?: () => void; // sem isto o botão ✕ não aparece
}

// Campo que não é digitado: abre um popup de busca e mostra o registro escolhido
export default function CampoBusca({ valor, placeholder = 'Clique para selecionar', disabled, onBuscar, onLimpar }: Props) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <input readOnly value={valor} placeholder={placeholder} onClick={() => { if (!disabled) onBuscar(); }}
        style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: disabled ? '#F5F0ED' : 'white', textOverflow: 'ellipsis' }}
        disabled={disabled} />
      {!disabled && onLimpar && valor && (
        <button type="button" onClick={onLimpar} title="Limpar"
          style={{ background: 'none', border: '1px solid #E8D5CC', borderRadius: 8, cursor: 'pointer', color: '#8B6E63', padding: '0 10px' }}>✕</button>
      )}
      <button type="button" onClick={onBuscar} disabled={disabled} title="Buscar"
        style={{ backgroundColor: disabled ? '#E8D5CC' : '#C97B6B', color: 'white', border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', padding: '0 14px', fontSize: 15 }}>
        🔍
      </button>
    </div>
  );
}
