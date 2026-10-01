import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle, erroBanner } from '../../styles/theme';

// Duração e preço ficam como texto enquanto o campo é editado: guardar já como number
// faz o React reescrever o valor a cada tecla (o "." do decimal some assim que é digitado,
// "80." vira "80" na hora), e a única forma confiável de mudar o valor passa a ser a setinha.
interface FormState {
  nome: string;
  descricao: string;
  duracaoMin: string;
  preco: string;
  ativo: boolean;
}

const EMPTY: FormState = { nome: '', descricao: '', duracaoMin: '', preco: '', ativo: true };

export default function ServicoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [erro, setErro] = useState('');

  // Limpa o erro ao editar qualquer campo, para uma mensagem de uma tentativa
  // anterior não continuar na tela como se ainda valesse para o valor atual
  const set = (changes: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  useEffect(() => {
    if (id) servicoService.buscar(Number(id)).then(r => {
      const s = r.data;
      setForm({ nome: s.nome, descricao: s.descricao, duracaoMin: String(s.duracaoMin), preco: String(s.preco), ativo: s.ativo });
    });
  }, [id]);

  const salvar = async () => {
    if (!form.nome.trim()) { setErro('Nome do serviço é obrigatório.'); return; }
    const duracaoMin = Number(form.duracaoMin);
    const preco = Number(form.preco);
    if (!form.duracaoMin || duracaoMin <= 0) { setErro('Duração deve ser maior que zero.'); return; }
    if (!form.preco || preco <= 0) { setErro('Preço deve ser maior que zero.'); return; }
    const payload: Servico = { nome: form.nome, descricao: form.descricao, duracaoMin, preco, ativo: form.ativo };
    try {
      if (id) await servicoService.atualizar(Number(id), payload);
      else await servicoService.salvar(payload);
      navigate('/servicos');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Serviço</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do serviço' : 'Preencha os dados do novo serviço'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Serviço *</label>
            <input style={inputStyle} placeholder="Nome do serviço..." value={form.nome} onChange={e => set({ nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Descrição</label>
            <input style={inputStyle} placeholder="Descrição do serviço..." value={form.descricao} onChange={e => set({ descricao: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Duração (min) *</label>
            <input type="number" min={0} step={1} style={inputStyle} placeholder="Ex: 60" value={form.duracaoMin} onChange={e => set({ duracaoMin: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Preço (R$) *</label>
            <input type="number" min={0} step={0.01} style={inputStyle} placeholder="Ex: 80.00" value={form.preco} onChange={e => set({ preco: e.target.value })} />
          </div>
        </div>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => set({ ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
          <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={salvar} style={btnPrimary}>Salvar</button>
          <button onClick={() => navigate('/servicos')} style={btnCancel}>Voltar</button>
        </div>
      </div>
    </div>
  );
}
