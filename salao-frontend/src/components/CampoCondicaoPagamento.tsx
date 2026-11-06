import { useEffect, useState } from 'react';
import { condicaoPagamentoService, type CondicaoPagamento } from '../services/condicaoPagamentoService';
import CondicaoPagamentoForm from '../pages/condicao/CondicaoPagamentoForm';
import ModalCadastro from './ModalCadastro';
import { inputStyle } from '../styles/theme';

interface Props {
  value: number | null;
  // na condição recém-cadastrada vem também o objeto (para a tela que guarda a própria lista de condições)
  onChange: (id: number | null, criada?: CondicaoPagamento) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Select de condição de pagamento com "+ Nova": cadastra a condição sem sair da tela e já a seleciona
export default function CampoCondicaoPagamento({ value, onChange, disabled, placeholder = 'Selecione' }: Props) {
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [cadastrando, setCadastrando] = useState(false);

  useEffect(() => {
    condicaoPagamentoService.listar().then(r => setCondicoes(r.data)).catch(() => setCondicoes([]));
  }, []);

  const criada = (c: CondicaoPagamento) => {
    setCadastrando(false);
    setCondicoes(prev => [...prev, c]);
    onChange(c.id, c);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        <select style={{ ...inputStyle, cursor: disabled ? 'not-allowed' : 'pointer' }} value={value ?? ''} disabled={disabled}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}>
          <option value="">{placeholder}</option>
          {condicoes.filter(c => c.ativo !== false || c.id === value).map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
        </select>
        {!disabled && (
          <button type="button" title="Cadastrar nova condição de pagamento" onClick={() => setCadastrando(true)}
            style={{ backgroundColor: '#C97B6B', color: 'white', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            + Nova
          </button>
        )}
      </div>
      {cadastrando && (
        <ModalCadastro aberto onFechar={() => setCadastrando(false)}>
          <CondicaoPagamentoForm embutido onSalvo={criada} onCancelar={() => setCadastrando(false)} />
        </ModalCadastro>
      )}
    </>
  );
}
