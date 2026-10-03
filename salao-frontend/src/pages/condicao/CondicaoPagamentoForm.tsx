import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { condicaoPagamentoService } from '../../services/condicaoPagamentoService';
import type { CondicaoPagamentoRequest } from '../../services/condicaoPagamentoService';
import { formaPagamentoService } from '../../services/formaPagamentoService';
import type { FormaPagamento } from '../../services/formaPagamentoService';
import { parcelaService } from '../../services/parcelaService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle } from '../../styles/theme';

interface ParcelaLocal {
  _key: number;
  id?: number;
  diasVencimento: number | '';
  percentual: string;
  formaPagamentoId: number;
}

// Multa/juro/desconto/percentual ficam como texto enquanto editados: guardar já como number
// faz o React reescrever o valor a cada tecla (o "." do decimal some assim que é digitado,
// "2.5" vira "2" na hora), e a única forma confiável de mudar o valor passa a ser a setinha.
interface FormLocal {
  condicao: string;
  multa: string;
  juro: string;
  desconto: string;
  ativo: boolean;
}

let _keyCounter = 0;
const newKey = () => ++_keyCounter;

const MAX_PARCELAS = 60;

// 100% dividido igualmente com 2 casas; a última parcela fica com o que sobrar do arredondamento
// (3 parcelas = 33,33 + 33,33 + 33,34)
const dividirPercentual = (n: number): string[] => {
  const base = Math.floor(10000 / n) / 100;
  const ultima = Math.round((100 - base * (n - 1)) * 100) / 100;
  return Array.from({ length: n }, (_, i) => String(i === n - 1 ? ultima : base));
};

// Monta n parcelas: as que já existem mantêm dias e forma; as novas seguem o mesmo intervalo de dias
// (30, 60, 90...) e a forma de pagamento da parcela anterior. O percentual é sempre redividido.
const gerarParcelas = (atuais: ParcelaLocal[], n: number): ParcelaLocal[] => {
  const percentuais = dividirPercentual(n);
  const lista: ParcelaLocal[] = [];
  for (let i = 0; i < n; i++) {
    const existente = atuais[i];
    if (existente) { lista.push({ ...existente, percentual: percentuais[i] }); continue; }
    const anterior = lista[i - 1];
    const antesDela = lista[i - 2];
    const diasAnterior = anterior ? Number(anterior.diasVencimento) || 0 : 0;
    const intervalo = anterior && antesDela && diasAnterior > (Number(antesDela.diasVencimento) || 0)
      ? diasAnterior - (Number(antesDela.diasVencimento) || 0) : 30;
    lista.push({
      _key: newKey(),
      diasVencimento: anterior ? diasAnterior + intervalo : 30,
      percentual: percentuais[i],
      formaPagamentoId: anterior?.formaPagamentoId ?? 0,
    });
  }
  return lista;
};

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 20 };

const thStyle: CSSProperties = {
  padding: '10px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: '#8B6E63',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  borderBottom: '1px solid #E8D5CC',
  whiteSpace: 'nowrap',
};
const tdStyle: CSSProperties = { padding: '7px 8px', fontSize: 14, verticalAlign: 'middle' };

const EMPTY: FormLocal = {
  condicao: '',
  multa: '',
  juro: '',
  desconto: '',
  ativo: true,
};

export default function CondicaoPagamentoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormLocal>(EMPTY);
  const [parcelas, setParcelas] = useState<ParcelaLocal[]>([]);
  const [numParcelas, setNumParcelas] = useState(''); // texto do campo; as linhas só mudam com um número válido
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    formaPagamentoService.listar().then(r => setFormas(r.data));

    if (id) {
      condicaoPagamentoService.buscarPorId(Number(id)).then(r => {
        const c = r.data as any;
        setForm({
          condicao: c.condicao,
          multa: c.multa != null ? String(c.multa) : '',
          juro: c.juro != null ? String(c.juro) : '',
          desconto: c.desconto != null ? String(c.desconto) : '',
          ativo: c.ativo,
        });

        if (c.parcelas && Array.isArray(c.parcelas) && c.parcelas.length > 0) {
          setNumParcelas(String(c.parcelas.length));
          setParcelas(c.parcelas.map((p: any) => ({
            _key: newKey(),
            id: p.id,
            diasVencimento: p.diasVencimento ?? 0,
            formaPagamentoId: p.formaPagamento?.id ?? p.formaPagamentoId ?? 0,
            percentual: p.percentual != null ? String(p.percentual) : '',
          })));
        } else {
          parcelaService.listar().then(pr => {
            const filtradas = pr.data.filter((pp: any) => pp.condicaoPagamento?.id === Number(id));
            setNumParcelas(filtradas.length ? String(filtradas.length) : '');
            setParcelas(filtradas.map((pp: any) => ({
              _key: newKey(),
              id: pp.id,
              diasVencimento: pp.diasVencimento ?? 0,
              formaPagamentoId: pp.formaPagamento?.id ?? 0,
              percentual: pp.percentual != null ? String(pp.percentual) : '',
            })));
          });
        }
      });
    }
  }, [id]);

  const mudarNumParcelas = (texto: string) => {
    setNumParcelas(texto);
    setErro('');
    const n = Number(texto);
    if (/^\d+$/.test(texto) && n >= 1 && n <= MAX_PARCELAS) setParcelas(prev => gerarParcelas(prev, n));
  };

  const updateParcela = (key: number, changes: Partial<ParcelaLocal>) => {
    setParcelas(prev => {
      const primeira = prev[0]?._key === key;
      return prev.map(p => {
        if (p._key === key) return { ...p, ...changes };
        // a forma escolhida na 1ª parcela vale também para as parcelas que ainda estão sem forma
        if (primeira && changes.formaPagamentoId && !p.formaPagamentoId) return { ...p, formaPagamentoId: changes.formaPagamentoId };
        return p;
      });
    });
  };

  const numParcelasInvalido = numParcelas !== '' && !(/^\d+$/.test(numParcelas) && Number(numParcelas) >= 1 && Number(numParcelas) <= MAX_PARCELAS);

  const total = parcelas.reduce((s, p) => s + (Number(p.percentual) || 0), 0);
  const totalOk = Math.abs(total - 100) < 0.01;

  const salvar = async () => {
    if (!form.condicao.trim()) { setErro('Condição de pagamento é obrigatória.'); return; }
    if (numParcelasInvalido) { setErro(`Número de parcelas deve ser um número inteiro de 1 a ${MAX_PARCELAS}.`); return; }
    if (parcelas.length === 0) { setErro('Informe o número de parcelas.'); return; }
    for (const [idx, p] of parcelas.entries()) {
      const n = idx + 1;
      if (String(p.diasVencimento) === '' || Number(p.diasVencimento) < 0) { setErro(`Dias para vencimento da parcela ${n} deve ser zero ou mais.`); return; }
      if (!Number(p.percentual) || Number(p.percentual) <= 0) { setErro(`Percentual da parcela ${n} deve ser maior que zero.`); return; }
      if (!p.formaPagamentoId) { setErro(`Selecione a forma de pagamento da parcela ${n}.`); return; }
    }
    if (!totalOk) { setErro(`A soma dos percentuais deve ser 100% (atual: ${total}%).`); return; }
    setErro('');
    try {
      const dto: CondicaoPagamentoRequest = {
        condicao: form.condicao,
        multa: form.multa === '' ? undefined : Number(form.multa),
        juro: form.juro === '' ? undefined : Number(form.juro),
        desconto: form.desconto === '' ? undefined : Number(form.desconto),
        ativo: form.ativo,
        parcelas: parcelas.map((p, idx) => ({
          ...(p.id ? { id: p.id } : {}),
          numeroParcela: idx + 1,
          diasVencimento: Number(p.diasVencimento),
          percentual: Number(p.percentual),
          formaPagamentoId: Number(p.formaPagamentoId),
        })),
      };

      if (id) {
        await condicaoPagamentoService.atualizar(Number(id), dto);
      } else {
        await condicaoPagamentoService.criar(dto);
      }

      navigate('/condicoes-pagamento');
    } catch (e: any) {
      setErro(e?.response?.data?.mensagem || e?.response?.data?.message || 'Erro ao salvar.');
    }
  };

  return (
    <div style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>Condição de Pagamento</h2>
        <p style={pageSubtitle}>Cadastre condições de pagamento com suas parcelas</p>
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && (
          <p style={{ color: '#721C24', backgroundColor: '#F8D7DA', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, marginTop: 0 }}>
            {erro}
          </p>
        )}

        {/* Linha 1 */}
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Código</label>
            <input
              style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }}
              value={id ?? '(auto)'}
              disabled
            />
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Condição Pgto *</label>
            <input
              style={inputStyle}
              placeholder="Ex: 30/60/90 Dias Boleto"
              value={form.condicao}
              onChange={e => setForm({ ...form, condicao: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Multa % (atraso)</label>
            <input
              type="number" min={0} max={100} step={0.01}
              style={inputStyle}
              placeholder="0,00"
              value={form.multa}
              onChange={e => setForm({ ...form, multa: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Juro % ao mês</label>
            <input
              type="number" min={0} max={100} step={0.01}
              style={inputStyle}
              placeholder="0,00"
              value={form.juro}
              onChange={e => setForm({ ...form, juro: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: 'span 1' }} />
        </div>

        {/* Linha 2 */}
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Desconto % (em dia)</label>
            <input
              type="number" min={0} max={100} step={0.01}
              style={inputStyle}
              placeholder="0,00"
              value={form.desconto}
              onChange={e => setForm({ ...form, desconto: e.target.value })}
            />
          </div>
          <p style={{ gridColumn: 'span 10', alignSelf: 'end', fontSize: 12, color: '#8B6E63', margin: '0 0 10px' }}>
            Aplicados na baixa de cada parcela: pagando até o vencimento ganha o <strong>desconto</strong>
            (no À Vista o vencimento é o próprio dia, então vira desconto à vista); pagando depois, perde o desconto
            e paga <strong>multa</strong> uma vez + <strong>juro</strong> proporcional aos dias de atraso.
          </p>
        </div>

        {/* Seção Parcelas */}
        <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 12, marginTop: 8 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>
            Parcelas
          </h3>
        </div>

        <div style={{ ...g12, marginBottom: 14 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Nº de Parcelas *</label>
            <input
              type="number" min={1} max={MAX_PARCELAS} step={1}
              style={{ ...inputStyle, borderColor: numParcelasInvalido ? '#E57373' : '#E8D5CC' }}
              placeholder="Ex: 3"
              value={numParcelas}
              onChange={e => mudarNumParcelas(e.target.value)}
            />
            {numParcelasInvalido && (
              <p style={{ fontSize: 11, color: '#721C24', margin: '4px 0 0' }}>Use um número inteiro de 1 a {MAX_PARCELAS}.</p>
            )}
          </div>
          <p style={{ gridColumn: 'span 10', alignSelf: 'end', fontSize: 12, color: '#8B6E63', margin: '0 0 10px' }}>
            As parcelas aparecem abaixo com o percentual dividido igualmente (o total precisa dar 100%) e vencimentos de 30 em 30 dias.
            Ajuste dias, percentual e forma de cada uma se precisar; a forma escolhida na 1ª parcela é copiada para as que estão sem forma.
          </p>
        </div>

        <div style={{ border: '1px solid #E8D5CC', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#FDF0E8' }}>
                <th style={{ ...thStyle, width: 70, textAlign: 'center' }}>Parcela</th>
                <th style={thStyle}>Dias para Vencimento *</th>
                <th style={{ ...thStyle, width: 130 }}>Percentual *</th>
                <th style={thStyle}>Forma de Pagamento *</th>
              </tr>
            </thead>
            <tbody>
              {parcelas.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#8B6E63', padding: '36px 16px', fontFamily: 'Playfair Display, serif', fontSize: 15 }}>
                    Informe o número de parcelas acima
                  </td>
                </tr>
              )}
              {parcelas.map((p, idx) => (
                <tr key={p._key} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#8B6E63', fontWeight: 700 }}>{idx + 1}</td>
                  <td style={tdStyle}>
                    <input
                      type="number" min={0}
                      style={{ ...inputStyle, width: '100%' }}
                      placeholder="Ex: 30"
                      value={p.diasVencimento}
                      onChange={e => {
                        if (e.target.value === '') {
                          updateParcela(p._key, { diasVencimento: '' });
                        } else {
                          const val = parseInt(e.target.value, 10);
                          updateParcela(p._key, { diasVencimento: isNaN(val) ? 0 : val });
                        }
                      }}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number" min={0} max={100} step={0.01}
                      style={{ ...inputStyle, width: '100%' }}
                      placeholder="Ex: 100"
                      value={p.percentual}
                      onChange={e => updateParcela(p._key, { percentual: e.target.value })}
                    />
                  </td>
                  <td style={tdStyle}>
                    <select
                      style={{ ...sel, width: '100%' }}
                      value={p.formaPagamentoId || ''}
                      onChange={e => updateParcela(p._key, { formaPagamentoId: Number(e.target.value) })}
                    >
                      <option value="">Selecione</option>
                      {formas.map(f => <option key={f.id} value={f.id}>{f.formaPagamento}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
            {parcelas.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid #E8D5CC' }}>
                  <td colSpan={2} style={{ ...tdStyle, color: '#8B6E63', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Total
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 700,
                      backgroundColor: totalOk ? '#D4EDDA' : '#F8D7DA',
                      color: totalOk ? '#2D6A4F' : '#721C24',
                    }}>
                      {total.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: '#8B6E63', fontSize: 12 }}>
                    {totalOk ? '✓ Percentual correto' : '⚠ Deve somar 100%'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <button
          onClick={salvar}
          style={{ backgroundColor: '#2C1A0E', color: 'white', border: 'none', borderRadius: 8, padding: 14, width: '100%', cursor: 'pointer', fontFamily: 'Lato, sans-serif', fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}
        >
          Salvar Condição
        </button>
      </div>
    </div>
  );
}
