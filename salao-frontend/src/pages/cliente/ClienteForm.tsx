import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Cliente } from '../../services/clienteService';
import { clienteService } from '../../services/clienteService';
import type { CondicaoPagamento } from '../../services/condicaoPagamentoService';
import { condicaoPagamentoService } from '../../services/condicaoPagamentoService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>{label}</h3>
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

export default function ClienteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Cliente>({ nome: '', ativo: true });
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);

  useEffect(() => {
    condicaoPagamentoService.listar().then(r => setCondicoes(r.data));
    if (id) {
      clienteService.buscar(Number(id)).then(r => {
        const c = r.data as any;
        setForm({ ...c, cidadeId: c.cidade?.id });
      });
    }
  }, [id]);

  const set = (changes: Partial<Cliente>) => setForm(prev => ({ ...prev, ...changes }));

  const salvar = async () => {
    const payload = { ...form, cidadeId: (form as any).cidadeId || null };
    try {
      if (id) await clienteService.atualizar(Number(id), payload as any);
      else await clienteService.salvar(payload as any);
      navigate('/clientes');
    } catch (e: any) {
      alert(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Cliente</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente'}</p>
      </div>

      <div style={{ ...card, padding: 32 }}>

        {/* ─── Dados Principais ─── */}
        <SectionHeader label="Dados Principais" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Código</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }} value={form.id ?? '(automático)'} disabled />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Tipo</label>
            <select style={sel} value={(form as any).tipo || ''} onChange={e => set({ tipo: e.target.value } as any)}>
              <option value="">Selecione</option>
              <option value="FISICA">Física</option>
              <option value="JURIDICA">Jurídica</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Cliente / Nome *</label>
            <input style={inputStyle} placeholder="Nome completo do cliente..." value={form.nome} onChange={e => set({ nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => set({ ativo: v })} />
          </div>
        </div>

        {/* ─── Dados Pessoais ─── */}
        <SectionHeader label="Dados Pessoais" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Apelido</label>
            <input style={inputStyle} placeholder="Apelido" value={form.apelido || ''} onChange={e => set({ apelido: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Estado Civil</label>
            <select style={sel} value={form.estadoCivil || ''} onChange={e => set({ estadoCivil: e.target.value })}>
              <option value="">Selecione</option>
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Sexo</label>
            <select style={sel} value={form.sexo || ''} onChange={e => set({ sexo: e.target.value })}>
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Nacionalidade</label>
            <input style={inputStyle} placeholder="Ex: Brasileira" value={(form as any).nacionalidade || ''} onChange={e => set({ nacionalidade: e.target.value } as any)} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Data Nascimento</label>
            <input type="date" style={inputStyle} value={form.dataNascimento || ''} onChange={e => set({ dataNascimento: e.target.value })} />
          </div>
        </div>

        {/* ─── Endereço ─── */}
        <SectionHeader label="Endereço" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Endereço *</label>
            <input style={inputStyle} placeholder="Rua, Avenida..." value={form.endereco || ''} onChange={e => set({ endereco: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Número *</label>
            <input style={inputStyle} placeholder="Nº" value={form.numero || ''} onChange={e => set({ numero: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CEP *</label>
            <input style={inputStyle} placeholder="00000-000" value={form.cep || ''} onChange={e => set({ cep: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Complemento</label>
            <input style={inputStyle} placeholder="Apto, Bloco..." value={form.complemento || ''} onChange={e => set({ complemento: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Bairro *</label>
            <input style={inputStyle} placeholder="Bairro" value={form.bairro || ''} onChange={e => set({ bairro: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Cidade *</label>
            <CidadeAutocomplete
              value={(form as any).cidadeId ?? null}
              onChange={cidadeId => set({ cidadeId: cidadeId ?? undefined } as any)}
            />
          </div>
        </div>

        {/* ─── Contato ─── */}
        <SectionHeader label="Contato" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Telefone *</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone || ''} onChange={e => set({ telefone: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Contato</label>
            <input style={inputStyle} placeholder="Nome do contato..." value={(form as any).contato || ''} onChange={e => set({ contato: e.target.value } as any)} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} placeholder="email@exemplo.com" value={form.email || ''} onChange={e => set({ email: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>RG</label>
            <input style={inputStyle} placeholder="RG" value={form.rg || ''} onChange={e => set({ rg: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CPF</label>
            <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf || ''} onChange={e => set({ cpf: e.target.value })} />
          </div>
        </div>

        {/* ─── Financeiro ─── */}
        <SectionHeader label="Financeiro" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Condição de Pagamento</label>
            <select
              style={sel}
              value={(form as any).condicaoPagamentoId || ''}
              onChange={e => set({ condicaoPagamentoId: Number(e.target.value) } as any)}
            >
              <option value="">Selecione</option>
              {condicoes.map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
            </select>
          </div>
        </div>

        {/* ─── Observações ─── */}
        <SectionHeader label="Observações" />
        <div style={{ marginBottom: 32 }}>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            placeholder="Observações sobre o cliente..."
            value={form.observacao || ''}
            onChange={e => set({ observacao: e.target.value })}
          />
        </div>

        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          Salvar Cliente
        </button>
      </div>
    </div>
  );
}
