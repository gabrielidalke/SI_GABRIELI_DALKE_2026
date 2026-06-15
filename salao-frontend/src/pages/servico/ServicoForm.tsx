import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Servico } from '../../services/servicoService';
import { servicoService } from '../../services/servicoService';

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
  fontSize: 13,
  fontWeight: 600,
  color: '#8B6F61',
  marginBottom: 6,
  letterSpacing: 0.5,
  textTransform: 'uppercase' as const,
};

export default function ServicoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Servico>({
    nome: '', descricao: '', duracaoMin: 0, preco: 0, ativo: true
  });

  useEffect(() => {
    if (id) servicoService.buscar(Number(id)).then(res => setForm(res.data));
  }, [id]);

  const salvar = async () => {
    if (id) {
      await servicoService.atualizar(Number(id), form);
    } else {
      await servicoService.salvar(form);
    }
    navigate('/servicos');
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, color: '#3D2B1F' }}>
          {id ? 'Editar' : 'Novo'} Serviço
        </h2>
        <p style={{ color: '#8B6F61', fontSize: 14, marginTop: 4 }}>
          {id ? 'Atualize os dados do serviço' : 'Preencha os dados do novo serviço'}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: 12, border: '1px solid #E8D5C8', padding: 32, boxShadow: '0 2px 12px rgba(201,123,99,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nome *</label>
            <input
              style={inputStyle}
              placeholder="Ex: Corte feminino, Escova..."
              value={form.nome}
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Descrição</label>
            <input
              style={inputStyle}
              placeholder="Descrição do serviço..."
              value={form.descricao}
              onChange={e => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div>
            <label style={labelStyle}>Duração (min) *</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 60"
              value={form.duracaoMin}
              onChange={e => setForm({ ...form, duracaoMin: Number(e.target.value) })}
            />
          </div>

          <div>
            <label style={labelStyle}>Preço (R$) *</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Ex: 80.00"
              value={form.preco}
              onChange={e => setForm({ ...form, preco: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="checkbox"
            id="ativo"
            checked={form.ativo}
            onChange={e => setForm({ ...form, ativo: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: '#C97B63', cursor: 'pointer' }}
          />
          <label htmlFor="ativo" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Ativo</label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={salvar}
            style={{ backgroundColor: '#C97B63', color: 'white', border: 'none', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 700 }}
          >
            Salvar
          </button>
          <button
            onClick={() => navigate('/servicos')}
            style={{ backgroundColor: 'transparent', color: '#8B6F61', border: '1px solid #E8D5C8', borderRadius: 8, padding: '10px 32px', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 14, fontWeight: 600 }}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}