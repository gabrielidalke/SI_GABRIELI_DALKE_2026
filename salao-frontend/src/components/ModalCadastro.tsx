import type { ReactNode } from 'react';
import { modalOverlay } from '../styles/theme';

interface Props {
  aberto: boolean;
  largura?: number;
  onFechar: () => void;
  children: ReactNode;
}

// Janela por cima da tela atual para cadastrar algo sem sair dela (fornecedor dentro da nota,
// cidade dentro do fornecedor...). Fica acima dos popups de busca.
export default function ModalCadastro({ aberto, largura = 1100, onFechar, children }: Props) {
  if (!aberto) return null;
  return (
    <div style={{ ...modalOverlay, zIndex: 1100, alignItems: 'flex-start', overflowY: 'auto', padding: '24px 0' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onFechar(); }}>
      <div style={{ position: 'relative', width: '94%', maxWidth: largura, backgroundColor: '#FDF6F0', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
        <button type="button" onClick={onFechar} title="Fechar" aria-label="Fechar"
          style={{ position: 'absolute', top: 12, right: 14, border: 'none', background: 'none', fontSize: 22, color: '#8B6E63', cursor: 'pointer', zIndex: 1 }}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
