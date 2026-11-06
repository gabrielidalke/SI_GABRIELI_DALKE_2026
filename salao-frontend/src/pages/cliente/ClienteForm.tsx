import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Cliente } from '../../services/clienteService';
import { clienteService } from '../../services/clienteService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle, erroBanner } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';
import TipoPessoaToggle from '../../components/TipoPessoaToggle';
import CampoCondicaoPagamento from '../../components/CampoCondicaoPagamento';
import CampoData from '../../components/CampoData';

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
  const [form, setForm] = useState<Cliente>({ nome: '', ativo: true, tipoPessoa: 'FISICA' });
  const [limiteCredito, setLimiteCredito] = useState(''); // texto enquanto digita (o ponto decimal não pode sumir)  const [erro, setErro] = useState('');
  const topoRef = useRef<HTMLDivElement>(null);

  // O formulário é longo: rola até o topo para a mensagem não ficar escondida
  const mostrarErro = (msg: string) => {
    setErro(msg);
    topoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {    if (id) {
      clienteService.buscar(Number(id)).then(r => {
        const c = r.data;
        setForm({ ...c, tipoPessoa: c.tipoPessoa ?? 'FISICA', cidadeId: c.cidade?.id, condicaoPagamentoId: c.condicaoPagamento?.id });
        setLimiteCredito(c.limiteCredito ? String(c.limiteCredito) : '');
      });
    }
  }, [id]);

  // Limpa o erro ao editar qualquer campo, para uma mensagem de uma tentativa
  // anterior não continuar na tela como se ainda valesse para o valor atual
  const set = (changes: Partial<Cliente>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  const juridica = form.tipoPessoa === 'JURIDICA';

  const salvar = async () => {
    if (form.nome.trim().length < 3) { mostrarErro('Nome do cliente deve ter pelo menos 3 letras.'); return; }
    if (!form.endereco?.trim()) { mostrarErro('Endereço é obrigatório.'); return; }
    if (!form.numero?.trim()) { mostrarErro('Número é obrigatório.'); return; }
    if (!form.cep?.trim()) { mostrarErro('CEP é obrigatório.'); return; }
    if (!form.bairro?.trim()) { mostrarErro('Bairro é obrigatório.'); return; }
    if (!(form as any).cidadeId) { mostrarErro('Cidade é obrigatória.'); return; }
    if (!form.telefone?.trim()) { mostrarErro('Telefone é obrigatório.'); return; }
    if (!form.email?.trim()) { mostrarErro('E-mail é obrigatório.'); return; }
    if (!form.condicaoPagamentoId) { mostrarErro('Condição de pagamento é obrigatória.'); return; }
    if (limiteCredito !== '' && !(Number(limiteCredito) >= 0)) { mostrarErro('Limite de crédito não pode ser negativo.'); return; }
    // trim() nos campos com formato fixo (telefone/CEP) evita espaço colado no início/fim reprovar a validação
    const payload = {
      ...form,
      telefone: form.telefone?.trim(),
      email: form.email?.trim(),
      cep: form.cep?.trim(),
      cidadeId: (form as any).cidadeId || null,
      limiteCredito: Number(limiteCredito) || 0,
    };
    try {
      if (id) await clienteService.atualizar(Number(id), payload as any);
      else await clienteService.salvar(payload as any);
      navigate('/clientes');
    } catch (e: any) {
      mostrarErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Cliente</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente'}</p>
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}

        {/* ─── Dados Principais ─── */}
        <SectionHeader label="Dados Principais" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Código</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }} value={form.id ?? '(automático)'} disabled />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Tipo de Pessoa *</label>
            <TipoPessoaToggle value={form.tipoPessoa ?? 'FISICA'} onChange={v => set({ tipoPessoa: v })} />
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
        <SectionHeader label={juridica ? 'Dados da Empresa' : 'Dados Pessoais'} />
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>{juridica ? 'Nome Fantasia' : 'Apelido'}</label>
            <input style={inputStyle} placeholder={juridica ? 'Nome fantasia' : 'Apelido'} value={form.apelido || ''} onChange={e => set({ apelido: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>{juridica ? 'CNPJ' : 'CPF'}</label>
            <input style={inputStyle} placeholder={juridica ? '00.000.000/0000-00' : '000.000.000-00'} value={form.cpfCnpj || ''} onChange={e => set({ cpfCnpj: e.target.value })} />
          </div>
          {juridica ? (
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Inscrição Estadual</label>
              <input style={inputStyle} placeholder="IE" value={form.inscricaoEstadual || ''} onChange={e => set({ inscricaoEstadual: e.target.value })} />
            </div>
          ) : (
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>RG</label>
              <input style={inputStyle} placeholder="RG" value={form.rg || ''} onChange={e => set({ rg: e.target.value })} />
            </div>
          )}
          {!juridica && (<>
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
            <label style={labelStyle}>Data Nascimento</label>
            <CampoData value={form.dataNascimento || ''} onChange={v => set({ dataNascimento: v })} />
          </div>
          </>)}
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
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} placeholder="email@exemplo.com" value={form.email || ''} onChange={e => set({ email: e.target.value })} />
          </div>
        </div>

        {/* ─── Financeiro ─── */}
        <SectionHeader label="Financeiro" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Condição de Pagamento *</label>
            <CampoCondicaoPagamento value={form.condicaoPagamentoId ?? null}
              onChange={v => set({ condicaoPagamentoId: v ?? undefined })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Limite de Crédito (R$)</label>
            <input type="number" min={0} step={0.01} style={inputStyle} placeholder="0,00" value={limiteCredito}
              onChange={e => { setLimiteCredito(e.target.value); setErro(''); }} />
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
