import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';
import { inputStyle, labelStyle, card, btnPrimary, btnCancel, pageTitle, pageSubtitle } from '../../styles/theme';

export default function ServicoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Servico>({ nome: '', descricao: '', duracaoMin: 0, preco: 0, ativo: true });

  useEffect(() => {
    if (id) servicoService.buscar(Number(id)).then(r => setForm(r.data));
  }, [id]);

  const salvar = async () => {
    if (id) await servicoService.atualizar(Number(id), form);
    else await servicoService.salvar(form);
    navigate('/servicos');
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{id ? 'Editar' : 'Novo'} Serviço</h2>
        <p style={pageSubtitle}>{id ? 'Atualize os dados do serviço' : 'Preencha os dados do novo serviço'}</p>
      </div>
      <div style={{ ...card, padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Serviço *</label>
            <input style={inputStyle} placeholder="Nome do serviço..." value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Descrição</label>
            <input style={inputStyle} placeholder="Descrição do serviço..." value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Duração (min) *</label>
            <input type="number" style={inputStyle} placeholder="Ex: 60" value={form.duracaoMin} onChange={e => setForm({ ...form, duracaoMin: Number(e.target.value) })} />
          </div>
          <div>
            <label style={labelStyle}>Preço (R$) *</label>
            <input type="number" style={inputStyle} placeholder="Ex: 80.00" value={form.preco} onChange={e => setForm({ ...form, preco: Number(e.target.value) })} />
          </div>
        </div>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#C97B6B', cursor: 'pointer' }} />
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
