import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle, sectionTitle, erroBanner } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };

// Salário/comissão ficam como texto enquanto editados: guardar já como number faz o React
// reescrever o valor a cada tecla (o "." do decimal some assim que é digitado, "2000.50" vira
// "2000" na hora), e a única forma confiável de mudar o valor passa a ser a setinha.
type FormState = Omit<Funcionario, 'salario' | 'percentualComissao'> & {
  cidadeId?: number;
  salario: string;
  percentualComissao: string;
};

export default function FuncionarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    nome: '', email: '', telefone: '', dataAdmissao: '', ativo: true, salario: '', percentualComissao: '',
  });
  const [erro, setErro] = useState('');
  const topoRef = useRef<HTMLDivElement>(null);

  // O formulário é longo: rola até o topo para a mensagem não ficar escondida
  const mostrarErro = (msg: string) => {
    setErro(msg);
    topoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Limpa o erro ao editar qualquer campo, para uma mensagem de uma tentativa
  // anterior não continuar na tela como se ainda valesse para o valor atual
  const set = (changes: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  useEffect(() => {
    if (id) funcionarioService.buscar(Number(id)).then(r => {
      const f = r.data;
      setForm({
        ...f,
        cidadeId: (f as any).cidade?.id,
        salario: f.salario != null ? String(f.salario) : '',
        percentualComissao: f.percentualComissao != null ? String(f.percentualComissao) : '',
      });
    });
  }, [id]);

  const salvar = async () => {
    if (!form.cep?.trim()) { mostrarErro('CEP é obrigatório.'); return; }
    if (!form.telefone.trim()) { mostrarErro('Telefone é obrigatório.'); return; }
    if (!form.email.trim()) { mostrarErro('E-mail é obrigatório.'); return; }
    if (!form.nome.trim()) { mostrarErro('Nome do funcionário é obrigatório.'); return; }
    if (!form.dataAdmissao) { mostrarErro('Data de admissão é obrigatória.'); return; }
    // Data apagada no input vira '' — manda sem o campo (null no backend).
    // trim() nos campos com formato fixo (telefone/CEP) evita espaço colado no início/fim reprovar a validação
    const payload = {
      ...form,
      telefone: form.telefone.trim(),
      email: form.email.trim(),
      cep: form.cep?.trim(),
      dataNascimento: form.dataNascimento || undefined,
      dataDemissao: form.dataDemissao || undefined,
      salario: form.salario === '' ? undefined : Number(form.salario),
      percentualComissao: form.percentualComissao === '' ? undefined : Number(form.percentualComissao),
    };
    try {
      if (id) await funcionarioService.atualizar(Number(id), payload as any);
      else await funcionarioService.salvar(payload as any);
      navigate('/funcionarios');
    } catch (e: any) {
      mostrarErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Funcionário</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do funcionário' : 'Preencha os dados do novo funcionário'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}

        <p style={{ ...sectionTitle, marginTop: 0 }}>Endereço</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CEP *</label>
            <input style={inputStyle} placeholder="00000-000" value={form.cep || ''} onChange={e => set({ cep: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Número</label>
            <input style={inputStyle} placeholder="Nº" value={form.numero || ''} onChange={e => set({ numero: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Bairro</label>
            <input style={inputStyle} placeholder="Bairro" value={form.bairro || ''} onChange={e => set({ bairro: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 9' }}>
            <label style={labelStyle}>Endereço</label>
            <input style={inputStyle} placeholder="Rua, Avenida..." value={form.endereco || ''} onChange={e => set({ endereco: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Complemento</label>
            <input style={inputStyle} placeholder="Apto, Bloco..." value={form.complemento || ''} onChange={e => set({ complemento: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 12' }}>
            <label style={labelStyle}>Cidade</label>
            <CidadeAutocomplete
              value={form.cidadeId ?? null}
              onChange={cidadeId => set({ cidadeId: cidadeId ?? undefined })}
            />
          </div>
        </div>

        <p style={sectionTitle}>Contato</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Telefone *</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => set({ telefone: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} placeholder="email@exemplo.com" value={form.email} onChange={e => set({ email: e.target.value })} />
          </div>
        </div>

        <p style={sectionTitle}>Dados Pessoais</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Funcionário *</label>
            <input style={inputStyle} placeholder="Nome do funcionário..." value={form.nome} onChange={e => set({ nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Apelido</label>
            <input style={inputStyle} placeholder="Como é conhecido..." value={form.apelido || ''} onChange={e => set({ apelido: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CPF</label>
            <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf || ''} onChange={e => set({ cpf: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Data de Nascimento</label>
            <input type="date" style={inputStyle} value={form.dataNascimento || ''} onChange={e => set({ dataNascimento: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Sexo</label>
            <select style={sel} value={form.sexo || ''} onChange={e => set({ sexo: e.target.value })}>
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Estado Civil</label>
            <select style={sel} value={form.estadoCivil || ''} onChange={e => set({ estadoCivil: e.target.value })}>
              <option value="">Selecione</option>
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
            </select>
          </div>
        </div>

        <p style={sectionTitle}>Dados Profissionais</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data de Admissão *</label>
            <input type="date" style={inputStyle} value={form.dataAdmissao} onChange={e => set({ dataAdmissao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data de Demissão</label>
            <input type="date" style={inputStyle} value={form.dataDemissao || ''} onChange={e => set({ dataDemissao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Salário (R$)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 2000.00" value={form.salario} onChange={e => set({ salario: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Comissão (%)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 30" value={form.percentualComissao} onChange={e => set({ percentualComissao: e.target.value })} />
          </div>
        </div>

        <p style={sectionTitle}>Observações</p>
        <div style={{ marginBottom: 24 }}>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Observações sobre o funcionário..." value={form.observacao || ''} onChange={e => set({ observacao: e.target.value })} />
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => set({ ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
          <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={salvar} style={btnPrimary}>Salvar</button>
          <button onClick={() => navigate('/funcionarios')} style={btnCancel}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
