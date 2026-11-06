import type { TipoPessoa } from '../services/tipoPessoa';

interface Props {
  value: TipoPessoa;
  onChange: (v: TipoPessoa) => void;
  disabled?: boolean;
}

const OPCOES: { valor: TipoPessoa; rotulo: string }[] = [
  { valor: 'FISICA', rotulo: 'Física' },
  { valor: 'JURIDICA', rotulo: 'Jurídica' },
];

// Pessoa física ou jurídica: troca os campos do formulário (CPF/RG ou CNPJ/Inscrição Estadual)
export default function TipoPessoaToggle({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC', width: 'fit-content', marginTop: 2 }}>
      {OPCOES.map((o, i) => (
        <button key={o.valor} type="button" disabled={disabled} onClick={() => onChange(o.valor)}
          style={{
            padding: '10px 20px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
            backgroundColor: value === o.valor ? '#C97B6B' : 'white', color: value === o.valor ? 'white' : '#8B6E63',
            borderLeft: i > 0 ? '1px solid #E8D5CC' : 'none',
          }}>
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
