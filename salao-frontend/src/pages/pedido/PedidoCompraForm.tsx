import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { pedidoCompraService, type PedidoCompraChave, type SituacaoPedido } from '../../services/pedidoCompraService';
import { mensagemDeErro } from '../../services/notaEntradaService';
import { produtoService, type Produto } from '../../services/produtoService';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle, th, erroBanner, btnPrimary, btnCancel } from '../../styles/theme';

const API = 'http://localhost:8080/api';
const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };
const dicaErro: CSSProperties = { fontSize: 11, color: '#721C24', marginTop: 4, marginBottom: 0 };

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>{label}</h3>
  </div>
);

const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const fmt = (v: number) => `R$ ${(v || 0).toFixed(2)}`;
const inteiroPositivo = (t: string) => /^\d+$/.test(t.trim()) && Number(t) > 0;

// Quantidade/valor ficam como texto enquanto editados (o "." do decimal não pode sumir ao digitar)
interface ItemLocal {
  produtoId: number;
  quantidade: string;
  valorUnitario: string;
  quantidadeRecebida: number;
}

export default function PedidoCompraForm() {
  const params = useParams();
  const navigate = useNavigate();
  const topoRef = useRef<HTMLDivElement>(null);

  const isNovo = !params.modelo;
  const chaveEdicao: PedidoCompraChave | null = isNovo ? null : {
    modelo: Number(params.modelo), serie: Number(params.serie),
    numero: Number(params.numero), fornecedorId: Number(params.fornecedorId),
  };

  const [chave, setChave] = useState({ modelo: '1', serie: '1', numero: '' });
  const [fornecedorIdInput, setFornecedorIdInput] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [chaveValidada, setChaveValidada] = useState(false);
  const [erroChave, setErroChave] = useState('');
  const [validando, setValidando] = useState(false);

  const [dataPedido, setDataPedido] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemLocal[]>([]);
  const [novo, setNovo] = useState({ produtoId: '' as number | '', quantidade: '1', valorUnitario: '' });
  const [erroItem, setErroItem] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [situacao, setSituacao] = useState<SituacaoPedido | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(!isNovo);
  const [salvando, setSalvando] = useState(false);

  const somenteLeitura = situacao !== null && situacao !== 'ABERTA';
  const formLiberado = chaveValidada && !somenteLeitura;
  const hoje = hojeISO();
  const erroData = dataPedido && dataPedido > hoje ? 'Data do pedido não pode ser posterior à data atual.' : '';

  const mostrarErro = (msg: string) => { setErro(msg); topoRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  useEffect(() => {
    produtoService.listar().then(r => setProdutos(r.data))
      .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os produtos.')));
  }, []);

  useEffect(() => {
    if (!chaveEdicao) return;
    pedidoCompraService.buscar(chaveEdicao).then(r => {
      const p = r.data;
      setSituacao(p.situacao);
      setChave({ modelo: String(p.modelo), serie: String(p.serie), numero: String(p.numero) });
      setFornecedorIdInput(String(p.fornecedor.id));
      setFornecedorNome(p.fornecedor.nome ?? '');
      setChaveValidada(true);
      setDataPedido(p.dataPedido);
      setObservacoes(p.observacoes ?? '');
      setItens(p.itens.map(i => ({
        produtoId: i.produtoId, quantidade: String(i.quantidade),
        valorUnitario: String(i.valorUnitario), quantidadeRecebida: i.quantidadeRecebida,
      })));
      setCarregando(false);
    }).catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar o pedido.')); setCarregando(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.modelo, params.serie, params.numero, params.fornecedorId]);

  const validarChave = async () => {
    setErroChave('');
    if (!inteiroPositivo(chave.modelo)) { setErroChave('Informe o Modelo (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.serie)) { setErroChave('Informe a Série (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.numero)) { setErroChave('Informe o Número do pedido (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(fornecedorIdInput)) { setErroChave('Informe o ID do Fornecedor.'); return; }
    setValidando(true);
    try {
      const f = await axios.get<{ fornecedor: string; ativo: boolean }>(`${API}/fornecedores/${Number(fornecedorIdInput)}`);
      if (f.data.ativo === false) { setErroChave('Fornecedor inativo. Escolha outro.'); return; }
      const existe = await pedidoCompraService.existe({
        modelo: Number(chave.modelo), serie: Number(chave.serie),
        numero: Number(chave.numero), fornecedorId: Number(fornecedorIdInput),
      });
      if (existe.data.existe) { setErroChave('Já existe um pedido com este Modelo / Série / Número para este fornecedor.'); return; }
      setFornecedorNome(f.data.fornecedor);
      setChaveValidada(true);
    } catch (e) {
      setErroChave(mensagemDeErro(e, 'Fornecedor não encontrado.'));
    } finally {
      setValidando(false);
    }
  };

  const adicionarItem = () => {
    if (!novo.produtoId) { setErroItem('Selecione o produto.'); return; }
    if (!novo.quantidade || Number(novo.quantidade) <= 0) { setErroItem('Quantidade deve ser maior que zero.'); return; }
    if (novo.valorUnitario === '' || Number(novo.valorUnitario) < 0) { setErroItem('Valor unitário é obrigatório e não pode ser negativo.'); return; }
    if (itens.some(i => i.produtoId === novo.produtoId)) { setErroItem('Este produto já está no pedido. Remova a linha antes de adicionar de novo.'); return; }
    setItens(prev => [...prev, { produtoId: novo.produtoId as number, quantidade: novo.quantidade, valorUnitario: novo.valorUnitario, quantidadeRecebida: 0 }]);
    setNovo({ produtoId: '', quantidade: '1', valorUnitario: '' });
    setErroItem('');
  };

  const produtoDe = (id: number) => produtos.find(p => p.id === id);
  const total = itens.reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0), 0);

  const salvar = async () => {
    if (!chaveValidada) { mostrarErro('Valide a chave do pedido (Modelo, Série, Número e Fornecedor) antes de salvar.'); return; }
    if (!dataPedido) { mostrarErro('Data do pedido é obrigatória.'); return; }
    if (erroData) { mostrarErro(erroData); return; }
    if (itens.length === 0) { mostrarErro('Adicione pelo menos um produto ao pedido.'); return; }
    setSalvando(true);
    setErro('');
    const dto = {
      modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero),
      fornecedorId: Number(fornecedorIdInput), dataPedido,
      observacoes: observacoes.trim() || undefined,
      itens: itens.map(i => ({ produtoId: i.produtoId, quantidade: Number(i.quantidade), valorUnitario: Number(i.valorUnitario) })),
    };
    try {
      if (chaveEdicao) await pedidoCompraService.atualizar(chaveEdicao, dto);
      else await pedidoCompraService.criar(dto);
      navigate('/pedidos-compra');
    } catch (e) {
      mostrarErro(mensagemDeErro(e, 'Erro ao salvar o pedido.'));
      setSalvando(false);
    }
  };

  if (carregando) return <div style={{ padding: 32 }}>Carregando...</div>;

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={pageTitle}>{somenteLeitura ? 'Pedido de Compra' : (isNovo ? 'Novo Pedido de Compra' : 'Editar Pedido de Compra')}</h2>
        <p style={pageSubtitle}>O pedido é identificado por Modelo + Série + Número + Fornecedor</p>
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}
        {somenteLeitura && (
          <p style={{ backgroundColor: '#FFF3CD', color: '#856404', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 0 }}>
            Este pedido já recebeu produtos por notas de entrada ({situacao === 'CONCLUIDA' ? 'concluído' : 'parcial'}) e não pode mais ser alterado.
          </p>
        )}

        <SectionHeader label="Identificação do Pedido (chave)" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Modelo *</label>
            <input type="number" min={1} step={1} style={inputStyle} value={chave.modelo}
              onChange={e => { setChave({ ...chave, modelo: e.target.value }); setErroChave(''); }} disabled={chaveValidada} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Série *</label>
            <input type="number" min={1} step={1} style={inputStyle} value={chave.serie}
              onChange={e => { setChave({ ...chave, serie: e.target.value }); setErroChave(''); }} disabled={chaveValidada} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Número *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="Ex: 1001" value={chave.numero}
              onChange={e => { setChave({ ...chave, numero: e.target.value }); setErroChave(''); }} disabled={chaveValidada} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>ID Fornecedor *</label>
            <input type="number" min={1} step={1} style={inputStyle} value={fornecedorIdInput}
              onChange={e => { setFornecedorIdInput(e.target.value); setErroChave(''); }} disabled={chaveValidada} />
          </div>
          <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'flex-end' }}>
            {!chaveValidada && (
              <button type="button" onClick={validarChave} disabled={validando} style={{ ...btnPrimary, padding: '10px 20px', opacity: validando ? 0.6 : 1 }}>
                {validando ? 'Validando...' : '🔍 Validar chave'}
              </button>
            )}
          </div>
        </div>
        {erroChave && <p style={{ ...erroBanner, marginTop: -8 }}>{erroChave}</p>}
        {chaveValidada ? (
          <p style={{ color: '#2D6A4F', fontWeight: 600, fontSize: 14, marginTop: -8 }}>
            ✓ Pedido {chave.numero}/{chave.serie} (modelo {chave.modelo}) — Fornecedor: {fornecedorNome || `#${fornecedorIdInput}`}
          </p>
        ) : (
          <p style={{ color: '#8B6E63', fontSize: 13, fontStyle: 'italic', marginTop: -8 }}>
            Valide a chave para liberar o restante do formulário.
          </p>
        )}

        <SectionHeader label="Dados do Pedido" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data do Pedido *</label>
            <input type="date" max={hoje} style={inputStyle} value={dataPedido}
              onChange={e => { setDataPedido(e.target.value); setErro(''); }} disabled={!formLiberado} />
            {erroData && <p style={dicaErro}>{erroData}</p>}
          </div>
        </div>

        {!somenteLeitura && (<>
          <SectionHeader label="Adicionar Produto" />
          <div style={g12}>
            <div style={{ gridColumn: 'span 5' }}>
              <label style={labelStyle}>Produto *</label>
              <select style={sel} value={novo.produtoId} disabled={!formLiberado}
                onChange={e => {
                  const id = e.target.value ? Number(e.target.value) : '';
                  const p = id === '' ? undefined : produtoDe(id);
                  setNovo(prev => {
                    // o valor sugerido (preço de custo) acompanha o produto; um valor digitado é respeitado
                    const anterior = prev.produtoId === '' ? undefined : produtoDe(prev.produtoId);
                    const sugerido = prev.valorUnitario === '' || (anterior != null && String(anterior.precoCusto ?? 0) === prev.valorUnitario);
                    return { ...prev, produtoId: id, valorUnitario: sugerido && p ? String(p.precoCusto ?? 0) : prev.valorUnitario };
                  });
                  setErroItem('');
                }}>
                <option value="">Selecione</option>
                {produtos.filter(p => p.ativo !== false).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Quantidade *</label>
              <input type="number" min={0.001} step={0.001} style={inputStyle} value={novo.quantidade} disabled={!formLiberado}
                onChange={e => { setNovo({ ...novo, quantidade: e.target.value }); setErroItem(''); }} />
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Valor Unitário (R$) *</label>
              <input type="number" min={0} step={0.01} style={inputStyle} value={novo.valorUnitario} disabled={!formLiberado}
                onChange={e => { setNovo({ ...novo, valorUnitario: e.target.value }); setErroItem(''); }} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end' }}>
              <button type="button" onClick={adicionarItem} disabled={!formLiberado}
                style={{ backgroundColor: 'transparent', border: '1px dashed #C97B6B', color: '#C97B6B', borderRadius: 6, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, width: '100%' }}>
                + Adicionar
              </button>
            </div>
          </div>
          {erroItem && <p style={{ ...erroBanner, marginTop: -8 }}>{erroItem}</p>}
        </>)}

        <SectionHeader label="Produtos do Pedido" />
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {['Produto', 'Quantidade', 'Valor Unit.', 'Recebido', 'Total'].map(h => <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>)}
              {formLiberado && <th style={{ ...th, padding: '8px 12px', width: 50 }} />}
            </tr>
          </thead>
          <tbody>
            {itens.map(i => (
              <tr key={i.produtoId} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={{ padding: '8px 10px', fontSize: 13 }}>{produtoDe(i.produtoId)?.nome || '—'}</td>
                <td style={{ padding: '8px 10px', fontSize: 13 }}>{i.quantidade}</td>
                <td style={{ padding: '8px 10px', fontSize: 13 }}>{fmt(Number(i.valorUnitario))}</td>
                <td style={{ padding: '8px 10px', fontSize: 13 }}>{i.quantidadeRecebida}</td>
                <td style={{ padding: '8px 10px', fontSize: 14, fontWeight: 600, color: '#C97B6B' }}>{fmt((Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0))}</td>
                {formLiberado && (
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <button type="button" title="Remover" onClick={() => setItens(prev => prev.filter(x => x.produtoId !== i.produtoId))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C97B6B' }}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
            {itens.length === 0 && (
              <tr><td colSpan={formLiberado ? 6 : 5} style={{ padding: 24, textAlign: 'center', color: '#8B6E63', fontSize: 13 }}>Nenhum produto adicionado</td></tr>
            )}
          </tbody>
          {itens.length > 0 && (
            <tfoot>
              <tr style={{ borderTop: '2px solid #E8D5CC', backgroundColor: '#FDF0E8' }}>
                <td colSpan={4} style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13 }}>Total do pedido</td>
                <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 14, color: '#C97B6B' }}>{fmt(total)}</td>
                {formLiberado && <td />}
              </tr>
            </tfoot>
          )}
        </table>

        <SectionHeader label="Observações" />
        <div style={{ marginBottom: 32 }}>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} maxLength={500}
            placeholder="Observações sobre o pedido..." value={observacoes}
            onChange={e => setObservacoes(e.target.value)} disabled={!formLiberado} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {!somenteLeitura && (
            <button onClick={salvar} disabled={salvando} style={{ ...btnPrimary, opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          <button onClick={() => navigate('/pedidos-compra')} style={btnCancel}>{somenteLeitura ? 'Fechar' : 'Cancelar'}</button>
        </div>
      </div>
    </div>
  );
}
