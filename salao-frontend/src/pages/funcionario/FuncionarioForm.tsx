import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle, sectionTitle } from '../../styles/theme';
import CidadeAutocomplete from '../../components/CidadeAutocomplete';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };

export default function FuncionarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Funcionario & { cidadeId?: number }>({
    nome: '', email: '', telefone: '', dataAdmissao: '', ativo: true,
  });

  useEffect(() => {
    if (id) funcionarioService.buscar(Number(id)).then(r => {
      const f = r.data as any;
      setForm({ ...f, cidadeId: f.cidade?.id });
    });
  }, [id]);

  const salvar = async () => {
    if (id) await funcionarioService.atualizar(Number(id), form as any);
    else await funcionarioService.salvar(form as any);
    navigate('/funcionarios');
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Funcionário</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do funcionário' : 'Preencha os dados do novo funcionário'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>

        <p style={{ ...sectionTitle, marginTop: 0 }}>Endereço</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CEP</label>
            <input style={inputStyle} placeholder="00000-000" value={form.cep || ''} onChange={e => setForm({ ...form, cep: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Número</label>
            <input style={inputStyle} placeholder="Nº" value={form.numero || ''} onChange={e => setForm({ ...form, numero: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Bairro</label>
            <input style={inputStyle} placeholder="Bairro" value={form.bairro || ''} onChange={e => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 9' }}>
            <label style={labelStyle}>Endereço</label>
            <input style={inputStyle} placeholder="Rua, Avenida..." value={form.endereco || ''} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Complemento</label>
            <input style={inputStyle} placeholder="Apto, Bloco..." value={form.complemento || ''} onChange={e => setForm({ ...form, complemento: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 12' }}>
            <label style={labelStyle}>Cidade</label>
            <CidadeAutocomplete
              value={form.cidadeId ?? null}
              onChange={cidadeId => setForm({ ...form, cidadeId: cidadeId ?? undefined })}
            />
          </div>
        </div>

        <p style={sectionTitle}>Contato</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Telefone *</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} placeholder="email@exemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        <p style={sectionTitle}>Dados Pessoais</p>
        <div style={g12}>
          <div style={{ gridColumn: 'span 8' }}>
            <label style={labelStyle}>Funcionário *</label>
            <input style={inputStyle} placeholder="Nome do funcionário..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Apelido</label>
            <input style={inputStyle} placeholder="Como é conhecido..." value={form.apelido || ''} onChange={e => setForm({ ...form, apelido: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>CPF</label>
            <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf || ''} onChange={e => setForm({ ...form, cpf: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Data de Nascimento</label>
            <input type="date" style={inputStyle} value={form.dataNascimento || ''} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Sexo</label>
            <select style={sel} value={form.sexo || ''} onChange={e => setForm({ ...form, sexo: e.target.value })}>
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Estado Civil</label>
            <select style={sel} value={form.estadoCivil || ''} onChange={e => setForm({ ...form, estadoCivil: e.target.value })}>
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
            <input type="date" style={inputStyle} value={form.dataAdmissao} onChange={e => setForm({ ...form, dataAdmissao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data de Demissão</label>
            <input type="date" style={inputStyle} value={form.dataDemissao || ''} onChange={e => setForm({ ...form, dataDemissao: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Salário (R$)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 2000.00" value={form.salario || ''} onChange={e => setForm({ ...form, salario: Number(e.target.value) })} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Comissão (%)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 30" value={form.percentualComissao || ''} onChange={e => setForm({ ...form, percentualComissao: Number(e.target.value) })} />
          </div>
        </div>

        <p style={sectionTitle}>Observações</p>
        <div style={{ marginBottom: 24 }}>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Observações sobre o funcionário..." value={form.observacao || ''} onChange={e => setForm({ ...form, observacao: e.target.value })} />
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
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
