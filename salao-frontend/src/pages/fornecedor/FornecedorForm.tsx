import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fornecedorService } from '../../services/fornecedorService';
import type { Fornecedor, FornecedorRequest } from '../../services/fornecedorService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';
import TipoPessoaToggle from '../../components/TipoPessoaToggle';
import CampoCondicaoPagamento from '../../components/CampoCondicaoPagamento';

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

const EMPTY: FornecedorRequest = {
  tipoPessoa: 'JURIDICA',
  fornecedor: '',
  nomeFantasia: '',
  cpfCnpj: '',
  rg: '',
  inscricaoEstadual: '',
  inscEstSubstTrib: '',
  inscricaoMunicipal: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  fone: '',
  celular: '',
  email: '',
  contato: '',
  site: '',
  observacao: '',
  ativo: true,
  cidadeId: null,
  condicaoPagamentoId: null,
};

interface Props {
  embutido?: boolean;                     // aberto dentro de outra tela (ex.: Nota de Entrada)
  onSalvo?: (f: Fornecedor) => void;     // devolve o fornecedor criado para já ficar selecionado
  onCancelar?: () => void;
}

export default function FornecedorForm({ embutido = false, onSalvo, onCancelar }: Props) {
  const { id: idRota } = useParams();
  const id = embutido ? undefined : idRota;
  const navigate = useNavigate();
  const [form, setForm] = useState<FornecedorRequest>(EMPTY);
  const [erro, setErro] = useState('');
  const topoRef = useRef<HTMLDivElement>(null);

  // O formulário é longo: rola até o topo para a mensagem não ficar escondida
  const mostrarErro = (msg: string) => {
    setErro(msg);
    topoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (id) {
      fornecedorService.buscar(Number(id)).then(r => {
        const f = r.data;
        setForm({
          tipoPessoa: f.tipoPessoa ?? 'JURIDICA',
          fornecedor: f.fornecedor,
          nomeFantasia: f.nomeFantasia || '',
          cpfCnpj: f.cpfCnpj || '',
          rg: f.rg || '',
          inscricaoEstadual: f.inscricaoEstadual || '',
          inscEstSubstTrib: f.inscEstSubstTrib || '',
          inscricaoMunicipal: f.inscricaoMunicipal || '',
          endereco: f.endereco || '',
          numero: f.numero || '',
          complemento: f.complemento || '',
          bairro: f.bairro || '',
          cep: f.cep || '',
          fone: f.fone || '',
          celular: f.celular || '',
          email: f.email || '',
          contato: f.contato || '',
          site: f.site || '',
          observacao: f.observacao || '',
          ativo: f.ativo,
          cidadeId: f.cidadeId ?? f.cidade?.id ?? null,
          condicaoPagamentoId: f.condicaoPagamentoId ?? f.condicaoPagamento?.id ?? null,
        });
      });
    }
  }, [id]);

  // Limpa o erro ao editar qualquer campo, para uma mensagem de uma tentativa
  // anterior não continuar na tela como se ainda valesse para o valor atual
  const set = (changes: Partial<FornecedorRequest>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  const juridica = form.tipoPessoa === 'JURIDICA';

  const salvar = async () => {
    if (!form.fornecedor.trim()) { mostrarErro('Nome do fornecedor é obrigatório.'); return; }
    if (!form.cep?.trim()) { mostrarErro('CEP é obrigatório.'); return; }
    setErro('');
    try {
      const dto: FornecedorRequest = { ...form };
      if (id) await fornecedorService.atualizar(Number(id), dto);
      else {
        const r = await fornecedorService.criar(dto);
        if (embutido) { onSalvo?.(r.data); return; }
      }
      navigate('/fornecedores');
    } catch (e: any) {
      mostrarErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Fornecedor</h2>
        <p style={pageSubtitle}>Preencha os dados do fornecedor abaixo</p>
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}

        {/* ─── Dados Principais ─── */}
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
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Tipo de Pessoa *</label>
            <TipoPessoaToggle value={form.tipoPessoa} onChange={v => set({ tipoPessoa: v })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Fornecedor / Nome *</label>
            <input
              style={inputStyle}
              placeholder="Nome da empresa ou pessoa..."
              value={form.fornecedor}
              onChange={e => set({ fornecedor: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Ativo</label>
            <ToggleYN value={form.ativo} onChange={v => set({ ativo: v })} />
          </div>
        </div>

        {/* ─── Dados da Empresa / Pessoa ─── */}
        <SectionHeader label={juridica ? 'Dados da Empresa' : 'Dados da Pessoa'} />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>{juridica ? 'Nome Fantasia' : 'Apelido'}</label>
            <input
              style={inputStyle}
              placeholder={juridica ? 'Nome fantasia...' : 'Como é conhecido...'}
              value={form.nomeFantasia || ''}
              onChange={e => set({ nomeFantasia: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Inscrição Municipal</label>
            <input
              style={inputStyle}
              placeholder="IM"
              value={form.inscricaoMunicipal || ''}
              onChange={e => set({ inscricaoMunicipal: e.target.value })}
            />
          </div>
        </div>

        {/* ─── Documentos ─── */}
        <SectionHeader label="Documentos" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>{juridica ? 'CNPJ' : 'CPF'}</label>
            <input
              style={inputStyle}
              placeholder={juridica ? '00.000.000/0000-00' : '000.000.000-00'}
              value={form.cpfCnpj || ''}
              onChange={e => set({ cpfCnpj: e.target.value })}
            />
          </div>
          {juridica ? (<>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>Inscrição Estadual</label>
              <input
                style={inputStyle}
                placeholder="IE"
                value={form.inscricaoEstadual || ''}
                onChange={e => set({ inscricaoEstadual: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>IE Substituto Tributário</label>
              <input
                style={inputStyle}
                placeholder="IE do substituto tributário"
                value={form.inscEstSubstTrib || ''}
                onChange={e => set({ inscEstSubstTrib: e.target.value })}
              />
            </div>
          </>) : (
            <div style={{ gridColumn: 'span 4' }}>
              <label style={labelStyle}>RG</label>
              <input
                style={inputStyle}
                placeholder="RG"
                value={form.rg || ''}
                onChange={e => set({ rg: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* ─── Endereço ─── */}
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
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Número</label>
            <input
              style={inputStyle}
              placeholder="Nº"
              value={form.numero || ''}
              onChange={e => set({ numero: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CEP *</label>
            <input
              style={inputStyle}
              placeholder="00000-000"
              value={form.cep || ''}
              onChange={e => set({ cep: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Complemento</label>
            <input
              style={inputStyle}
              placeholder="Apto, Bloco..."
              value={form.complemento || ''}
              onChange={e => set({ complemento: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Bairro</label>
            <input
              style={inputStyle}
              placeholder="Bairro"
              value={form.bairro || ''}
              onChange={e => set({ bairro: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Cidade</label>
            <CidadeAutocomplete
              value={form.cidadeId ?? null}
              onChange={cidadeId => set({ cidadeId: cidadeId })}
            />
          </div>
        </div>

        {/* ─── Contato ─── */}
        <SectionHeader label="Contato" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Telefone</label>
            <input
              style={inputStyle}
              placeholder="(00) 0000-0000"
              value={form.fone || ''}
              onChange={e => set({ fone: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Celular</label>
            <input
              style={inputStyle}
              placeholder="(00) 00000-0000"
              value={form.celular || ''}
              onChange={e => set({ celular: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              placeholder="email@fornecedor.com"
              value={form.email || ''}
              onChange={e => set({ email: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Contato</label>
            <input
              style={inputStyle}
              placeholder="Nome da pessoa de contato"
              value={form.contato || ''}
              onChange={e => set({ contato: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Site</label>
            <input
              style={inputStyle}
              placeholder="www.fornecedor.com.br"
              value={form.site || ''}
              onChange={e => set({ site: e.target.value })}
            />
          </div>
        </div>

        {/* ─── Financeiro ─── */}
        <SectionHeader label="Financeiro" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Condição de Pagamento</label>
            <CampoCondicaoPagamento value={form.condicaoPagamentoId ?? null} onChange={v => set({ condicaoPagamentoId: v })} />
          </div>
        </div>

        {/* ─── Observações ─── */}
        <SectionHeader label="Observações" />
        <div style={{ marginBottom: 32 }}>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
            placeholder="Observações sobre o fornecedor..."
            value={form.observacao || ''}
            onChange={e => set({ observacao: e.target.value })}
          />
        </div>

        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          Salvar Fornecedor
        </button>
        {embutido && (
          <button type="button" onClick={onCancelar}
            style={{ marginTop: 10, background: 'none', border: '1px solid #C97B6B', color: '#C97B6B', borderRadius: 8, padding: 12, width: '100%', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
