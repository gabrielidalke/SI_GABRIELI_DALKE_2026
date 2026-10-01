import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transportadoraService } from '../../services/transportadoraService';
import type { TransportadoraRequest } from '../../services/transportadoraService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';

const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>
      {label}
    </h3>
  </div>
);

const ToggleYN = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC', width: 'fit-content', marginTop: 2 }}>
    <button
      type="button"
      onClick={() => onChange(true)}
      style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: value ? '#C97B6B' : 'white', color: value ? 'white' : '#8B6E63', transition: 'all 0.2s' }}
    >Sim</button>
    <button
      type="button"
      onClick={() => onChange(false)}
      style={{ padding: '10px 20px', border: 'none', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600, backgroundColor: !value ? '#C97B6B' : 'white', color: !value ? 'white' : '#8B6E63', borderLeft: '1px solid #E8D5CC', transition: 'all 0.2s' }}
    >Não</button>
  </div>
);

const EMPTY: TransportadoraRequest = {
  nome: '',
  cpfCnpj: '',
  fone: '',
  endereco: '',
  bairro: '',
  cep: '',
  ativo: true,
  cidadeId: null,
};

export default function TransportadoraForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<TransportadoraRequest>(EMPTY);
  const [erro, setErro] = useState('');
  const topoRef = useRef<HTMLDivElement>(null);

  const mostrarErro = (msg: string) => {
    setErro(msg);
    topoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (id) {
      transportadoraService.buscar(Number(id)).then(r => {
        const t = r.data;
        setForm({
          nome: t.nome,
          cpfCnpj: t.cpfCnpj || '',
          fone: t.fone || '',
          endereco: t.endereco || '',
          bairro: t.bairro || '',
          cep: t.cep || '',
          ativo: t.ativo,
          cidadeId: t.cidadeId ?? t.cidade?.id ?? null,
        });
      });
    }
  }, [id]);

  const set = (changes: Partial<TransportadoraRequest>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  const salvar = async () => {
    if (!form.nome.trim()) { mostrarErro('Nome da transportadora é obrigatório.'); return; }
    setErro('');
    try {
      if (id) await transportadoraService.atualizar(Number(id), form);
      else await transportadoraService.criar(form);
      navigate('/transportadoras');
    } catch (e: any) {
      mostrarErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Nova'} Transportadora</h2>
        <p style={pageSubtitle}>Preencha os dados da transportadora abaixo</p>
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}

        <SectionHeader label="Dados Principais" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Código</label>
            <input
              style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }}
              value={id ?? '(automático)'}
              disabled
            />
          </div>
          <div style={{ gridColumn: 'span 7' }}>
            <label style={labelStyle}>Transportadora / Nome *</label>
            <input
              style={inputStyle}
              placeholder="Nome da transportadora..."
              value={form.nome}
              onChange={e => set({ nome: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => set({ ativo: v })} />
          </div>
        </div>

        <SectionHeader label="Documentos e Contato" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CPF / CNPJ</label>
            <input
              style={inputStyle}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={form.cpfCnpj || ''}
              onChange={e => set({ cpfCnpj: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Telefone</label>
            <input
              style={inputStyle}
              placeholder="(00) 0000-0000"
              value={form.fone || ''}
              onChange={e => set({ fone: e.target.value })}
            />
          </div>
        </div>

        <SectionHeader label="Endereço" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Endereço</label>
            <input
              style={inputStyle}
              placeholder="Rua, Avenida..."
              value={form.endereco || ''}
              onChange={e => set({ endereco: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>CEP</label>
            <input
              style={inputStyle}
              placeholder="00000-000"
              value={form.cep || ''}
              onChange={e => set({ cep: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Bairro</label>
            <input
              style={inputStyle}
              placeholder="Bairro"
              value={form.bairro || ''}
              onChange={e => set({ bairro: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Cidade</label>
            <CidadeAutocomplete
              value={form.cidadeId ?? null}
              onChange={cidadeId => set({ cidadeId })}
            />
          </div>
        </div>

        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5, marginTop: 8 }}
        >
          Salvar Transportadora
        </button>
      </div>
    </div>
  );
}
