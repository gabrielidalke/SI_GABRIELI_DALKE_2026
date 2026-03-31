import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Funcionario } from '../../services/funcionarioService';
import { funcionarioService } from '../../services/funcionarioService';

export default function FuncionarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Funcionario>({
    nome: '', email: '', telefone: '', dataAdmissao: '', ativo: true
  });

  useEffect(() => {
    if (id) funcionarioService.buscar(Number(id)).then(res => setForm(res.data));
  }, [id]);

  const salvar = async () => {
    if (id) {
      await funcionarioService.atualizar(Number(id), form);
    } else {
      await funcionarioService.salvar(form);
    }
    navigate('/funcionarios');
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{id ? 'Editar' : 'Novo'} Funcionário</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label>Nome*: </label>
          <input style={{ width: '100%' }} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div>
          <label>Apelido: </label>
          <input style={{ width: '100%' }} value={form.apelido || ''} onChange={e => setForm({ ...form, apelido: e.target.value })} />
        </div>
        <div>
          <label>Email*: </label>
          <input style={{ width: '100%' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Telefone*: </label>
          <input style={{ width: '100%' }} value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div>
          <label>CPF: </label>
          <input style={{ width: '100%' }} value={form.cpf || ''} onChange={e => setForm({ ...form, cpf: e.target.value })} />
        </div>
        <div>
          <label>Data Nascimento: </label>
          <input type="date" style={{ width: '100%' }} value={form.dataNascimento || ''} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
        </div>
        <div>
          <label>Data Admissão*: </label>
          <input type="date" style={{ width: '100%' }} value={form.dataAdmissao} onChange={e => setForm({ ...form, dataAdmissao: e.target.value })} />
        </div>
        <div>
          <label>Data Demissão: </label>
          <input type="date" style={{ width: '100%' }} value={form.dataDemissao || ''} onChange={e => setForm({ ...form, dataDemissao: e.target.value })} />
        </div>
        <div>
          <label>Sexo: </label>
          <select style={{ width: '100%' }} value={form.sexo || ''} onChange={e => setForm({ ...form, sexo: e.target.value })}>
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div>
          <label>Estado Civil: </label>
          <select style={{ width: '100%' }} value={form.estadoCivil || ''} onChange={e => setForm({ ...form, estadoCivil: e.target.value })}>
            <option value="">Selecione</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
          </select>
        </div>
        <div>
          <label>Salário: </label>
          <input type="number" style={{ width: '100%' }} value={form.salario || ''} onChange={e => setForm({ ...form, salario: Number(e.target.value) })} />
        </div>
        <div>
          <label>Comissão %: </label>
          <input type="number" style={{ width: '100%' }} value={form.percentualComissao || ''} onChange={e => setForm({ ...form, percentualComissao: Number(e.target.value) })} />
        </div>
        <div>
          <label>CEP: </label>
          <input style={{ width: '100%' }} value={form.cep || ''} onChange={e => setForm({ ...form, cep: e.target.value })} />
        </div>
        <div>
          <label>Endereço: </label>
          <input style={{ width: '100%' }} value={form.endereco || ''} onChange={e => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div>
          <label>Número: </label>
          <input style={{ width: '100%' }} value={form.numero || ''} onChange={e => setForm({ ...form, numero: e.target.value })} />
        </div>
        <div>
          <label>Bairro: </label>
          <input style={{ width: '100%' }} value={form.bairro || ''} onChange={e => setForm({ ...form, bairro: e.target.value })} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label>Observação: </label>
          <textarea style={{ width: '100%' }} value={form.observacao || ''} onChange={e => setForm({ ...form, observacao: e.target.value })} />
        </div>
        <div>
          <label>Ativo: </label>
          <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={salvar}>Salvar</button>
        {' '}
        <button onClick={() => navigate('/funcionarios')}>Voltar</button>
      </div>
    </div>
  );
}