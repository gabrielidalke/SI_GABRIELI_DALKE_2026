import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';
import type { Estado } from '../../services/estadoService';
import { estadoService } from '../../services/estadoService';
import type { Cidade } from '../../services/cidadeService';
import { cidadeService } from '../../services/cidadeService';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #E8D5C8',
  borderRadius: 8,
  fontFamily: 'Lato, sans-serif',
  fontSize: 14,
  color: '#3D2B1F',
  backgroundColor: 'white',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#8B6F61',
  marginBottom: 6,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

const sectionTitle = {
  fontFamily: 'Playfair Display, serif',
  fontSize: 16,
  color: '#C97B63',
  marginBottom: 16,
  marginTop: 8,
};

export default function FuncionarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Funcionario & { estadoId?: number; cidadeId?: number }>({
    nome: '', email: '', telefone: '', dataAdmissao: '', ativo: true
  });
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  useEffect(() => {
    estadoService.listar().then(res => setEstados(res.data));
    if (id) funcionarioService.buscar(Number(id)).then(res => {
      const f = res.data as any;
      setForm({ ...f, estadoId: f.cidade?.estado?.id, cidadeId: f.cidade?.id });
      if (f.cidade?.estado?.id) {
        cidadeService.listarPorEstado(f.cidade.estado.id).then(r => setCidades(r.data));
      }
    });
  }, [id]);

  const onEstadoChange = (estadoId: number) => {
    setForm({ ...form, estadoId, cidadeId: undefined });
    if (estadoId) cidadeService.listarPorEstado(estadoId).then(res => setCidades(res.data));
    else setCidades([]);
  };

  const salvar = async () => {
    if (id) {
      await funcionarioService.atualizar(Number(id), form as any);
    } else {
      await funcionarioService.salvar(form as any);
    }
    navigate('/funcionarios');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>
          {id ? 'EDITAR' : 'NOVO'} FUNCIONÁRIO
        </h2>
        <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>
          {id ? 'ATUALIZE OS DADOS DO FUNCIONÁRIO' : 'PREENCHA OS DADOS DO NOVO FUNCIONÁRIO'}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #E8D5C8', padding: 32, boxShadow: '0 2px 12px rgba(201,123,99,0.08)' }}>

        {/* ENDEREÇO */}
        <p style={sectionTitle}>ENDEREÇO</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>CEP</label>
            <input style={inputStyle} placeholder="00000-000" value={form.cep || ''} onChange={e => setForm({ ...form, cep: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>NÚMERO</label>
            <input style={inputStyle} placeholder="Nº" value={form.numero || ''} onChange={e => setForm({ ...form, numero: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>ENDEREÇO</label>
            <input style={inputStyle} placeholder="Rua, Avenida..." value={form.endereco || ''} onChange={e => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>BAIRRO</label>
            <input style={inputStyle} placeholder="Bairro" value={form.bairro || ''} onChange={e => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>COMPLEMENTO</label>
            <input style={inputStyle} placeholder="Apto, Bloco..." value={form.complemento || ''} onChange={e => setForm({ ...form, complemento: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>ESTADO</label>
            <select style={selectStyle} value={form.estadoId || ''} onChange={e => onEstadoChange(Number(e.target.value))}>
              <option value="">SELECIONE O ESTADO</option>
              {estados.map(e => <option key={e.id} value={e.id}>{e.nome} ({e.uf})</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>CIDADE</label>
            <select style={selectStyle} value={form.cidadeId || ''} onChange={e => setForm({ ...form, cidadeId: Number(e.target.value) })} disabled={cidades.length === 0}>
              <option value="">SELECIONE A CIDADE</option>
              {cidades.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        </div>

        {/* CONTATO */}
        <p style={sectionTitle}>CONTATO</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>TELEFONE *</label>
            <input style={inputStyle} placeholder="(00) 00000-0000" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>EMAIL *</label>
            <input style={inputStyle} placeholder="email@exemplo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        {/* DADOS PESSOAIS */}
        <p style={sectionTitle}>DADOS PESSOAIS</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>NOME *</label>
            <input style={inputStyle} placeholder="Nome completo" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>APELIDO</label>
            <input style={inputStyle} placeholder="Apelido" value={form.apelido || ''} onChange={e => setForm({ ...form, apelido: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>CPF</label>
            <input style={inputStyle} placeholder="000.000.000-00" value={form.cpf || ''} onChange={e => setForm({ ...form, cpf: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>DATA DE NASCIMENTO</label>
            <input type="date" style={inputStyle} value={form.dataNascimento || ''} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>SEXO</label>
            <select style={selectStyle} value={form.sexo || ''} onChange={e => setForm({ ...form, sexo: e.target.value })}>
              <option value="">SELECIONE</option>
              <option value="M">MASCULINO</option>
              <option value="F">FEMININO</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>ESTADO CIVIL</label>
            <select style={selectStyle} value={form.estadoCivil || ''} onChange={e => setForm({ ...form, estadoCivil: e.target.value })}>
              <option value="">SELECIONE</option>
              <option value="Solteiro(a)">SOLTEIRO(A)</option>
              <option value="Casado(a)">CASADO(A)</option>
              <option value="Divorciado(a)">DIVORCIADO(A)</option>
              <option value="Viúvo(a)">VIÚVO(A)</option>
            </select>
          </div>
        </div>

        {/* DADOS PROFISSIONAIS */}
        <p style={sectionTitle}>DADOS PROFISSIONAIS</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>DATA DE ADMISSÃO *</label>
            <input type="date" style={inputStyle} value={form.dataAdmissao} onChange={e => setForm({ ...form, dataAdmissao: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>DATA DE DEMISSÃO</label>
            <input type="date" style={inputStyle} value={form.dataDemissao || ''} onChange={e => setForm({ ...form, dataDemissao: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>SALÁRIO (R$)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 2000.00" value={form.salario || ''} onChange={e => setForm({ ...form, salario: Number(e.target.value) })} />
          </div>
          <div>
            <label style={labelStyle}>COMISSÃO (%)</label>
            <input type="number" style={inputStyle} placeholder="Ex: 30" value={form.percentualComissao || ''} onChange={e => setForm({ ...form, percentualComissao: Number(e.target.value) })} />
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        <p style={sectionTitle}>OBSERVAÇÕES</p>
        <div style={{ marginBottom: 24 }}>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Observações sobre o funcionário..." value={form.observacao || ''} onChange={e => setForm({ ...form, observacao: e.target.value })} />
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B63', cursor: 'pointer' }} />
          <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>ATIVO</label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={salvar} style={{ backgroundColor: '#C97B63', color: 'white', border: 'none', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}>
            SALVAR
          </button>
          <button onClick={() => navigate('/funcionarios')} style={{ backgroundColor: 'transparent', color: '#8B6F61', border: '1px solid #E8D5C8', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600 }}>
            VOLTAR
          </button>
        </div>
      </div>
    </div>
  );
}