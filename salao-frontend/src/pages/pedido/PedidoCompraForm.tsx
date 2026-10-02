import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pedidoCompraService, type PedidoCompraChave, type PedidoCompraRequest, type SituacaoPedido } from '../../services/pedidoCompraService';
import { mensagemDeErro } from '../../services/notaEntradaService';
import { produtoService, type Produto } from '../../services/produtoService';
import { classificacaoContaService, type ClassificacaoConta } from '../../services/classificacaoContaService';
import { condicaoPagamentoService, type CondicaoPagamento } from '../../services/condicaoPagamentoService';
import type { Fornecedor } from '../../services/fornecedorService';
import CampoBusca from '../../components/CampoBusca';
import { BuscarFornecedorModal } from '../../components/BuscaCadastros';
import { PainelProduto, TabelaItens, BlocoTotais } from '../../components/ItensCompra';
import { useItensCompra } from '../../utils/useItensCompra';
import { calcularItem, despesasVazias, hojeISO, inteiroPositivo, valorDe, type Despesas } from '../../utils/itensCompra';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle, erroBanner, btnPrimary, btnCancel } from '../../styles/theme';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };
const dicaErro: CSSProperties = { fontSize: 11, color: '#721C24', marginTop: 4, marginBottom: 0 };
const dica: CSSProperties = { fontSize: 11, color: '#8B6E63', marginTop: 4, marginBottom: 0 };

const situacaoCfg: Record<SituacaoPedido, { label: string; bg: string; color: string }> = {
  ABERTA: { label: 'Aberta', bg: '#FFF3CD', color: '#856404' },
  PARCIAL: { label: 'Parcialmente recebida', bg: '#D1ECF1', color: '#0C5460' },
  CONCLUIDA: { label: 'Concluída', bg: '#D4EDDA', color: '#2D6A4F' },
};

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>{label}</h3>
  </div>
);

const textoValor = (v?: number | null) => (v ? String(v) : '');

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
  const [fornecedor, setFornecedor] = useState<{ id: number; nome: string } | null>(null);
  const [chaveValidada, setChaveValidada] = useState(false);
  const [erroChave, setErroChave] = useState('');
  const [validando, setValidando] = useState(false);
  const [buscandoFornecedor, setBuscandoFornecedor] = useState(false);

  const [dataPedido, setDataPedido] = useState('');
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState<number | ''>('');
  const [condicaoDoFornecedor, setCondicaoDoFornecedor] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState('');
  const [despesas, setDespesas] = useState<Despesas>(despesasVazias);
  const [recebidos, setRecebidos] = useState<Record<number, number>>({});

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [classificacoes, setClassificacoes] = useState<ClassificacaoConta[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const lista = useItensCompra(produtos);

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
    Promise.all([produtoService.listar(), classificacaoContaService.listar(), condicaoPagamentoService.listar()])
      .then(([p, c, cp]) => { setProdutos(p.data); setClassificacoes(c.data); setCondicoes(cp.data); })
      .catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os cadastros de apoio.')));
  }, []);

  useEffect(() => {
    if (!chaveEdicao) return;
    pedidoCompraService.buscar(chaveEdicao).then(r => {
      const p = r.data;
      setSituacao(p.situacao);
      setChave({ modelo: String(p.modelo), serie: String(p.serie), numero: String(p.numero) });
      setFornecedor({ id: p.fornecedor.id, nome: p.fornecedor.nome ?? '' });
      setChaveValidada(true);
      setDataPedido(p.dataPedido);
      setCondicaoPagamentoId(p.condicaoPagamento?.id ?? '');
      setObservacoes(p.observacoes ?? '');
      setDespesas({ valorFrete: textoValor(p.valorFrete), valorSeguro: textoValor(p.valorSeguro), outrasDespesas: textoValor(p.outrasDespesas) });
      const rec: Record<number, number> = {};
      p.itens.forEach(i => { rec[i.produtoId] = i.quantidadeRecebida; });
      setRecebidos(rec);
      lista.carregar(p.itens.map(i => ({
        produtoId: i.produtoId, classificacaoContaId: i.classificacaoContaId ?? '',
        quantidade: String(i.quantidade), valorUnitario: String(i.valorUnitario),
        descontoModo: 'PERCENTUAL' as const, descontoInput: textoValor(i.descontoPercentual), persistido: false,
      })));
      setCarregando(false);
    }).catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar o pedido.')); setCarregando(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.modelo, params.serie, params.numero, params.fornecedorId]);

  // ------------------------------------------------------------------ chave

  const validarChave = async (forn = fornecedor) => {
    setErroChave('');
    if (!inteiroPositivo(chave.modelo)) { setErroChave('Informe o Modelo (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.serie)) { setErroChave('Informe a Série (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.numero)) { setErroChave('Informe o Número do pedido (número inteiro maior que zero).'); return; }
    if (!forn) { setErroChave('Selecione o fornecedor.'); return; }
    setValidando(true);
    try {
      const existe = await pedidoCompraService.existe({
        modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero), fornecedorId: forn.id,
      });
      if (existe.data.existe) { setErroChave('Já existe um pedido com este Modelo / Série / Número para este fornecedor.'); return; }
      setChaveValidada(true);
    } catch (e) {
      setErroChave(mensagemDeErro(e, 'Não foi possível validar a chave.'));
    } finally {
      setValidando(false);
    }
  };

  const aoSelecionarFornecedor = (f: Fornecedor) => {
    setBuscandoFornecedor(false);
    const escolhido = { id: f.id, nome: f.fornecedor };
    setFornecedor(escolhido);
    setErroChave('');
    // A condição de pagamento vem do fornecedor (a pessoa pode trocar depois)
    if (condicaoPagamentoId === '' || condicaoPagamentoId === condicaoDoFornecedor) {
      setCondicaoPagamentoId(f.condicaoPagamento?.id ?? '');
      setCondicaoDoFornecedor(f.condicaoPagamento?.id ?? null);
    }
    // com Modelo/Série/Número já preenchidos, valida direto
    if (inteiroPositivo(chave.modelo) && inteiroPositivo(chave.serie) && inteiroPositivo(chave.numero)) validarChave(escolhido);
  };

  // ------------------------------------------------------------------ salvar

  const salvar = async () => {
    if (!chaveValidada || !fornecedor) { mostrarErro('Valide a chave do pedido (Modelo, Série, Número e Fornecedor) antes de salvar.'); return; }
    if (!dataPedido) { mostrarErro('Data do pedido é obrigatória.'); return; }
    if (erroData) { mostrarErro(erroData); return; }
    if (lista.itens.length === 0) { mostrarErro('Adicione pelo menos um produto ao pedido.'); return; }
    for (const [idx, i] of lista.itens.entries()) {
      if (!i.classificacaoContaId) {
        mostrarErro(`Selecione a classificação da conta do item ${idx + 1} (${lista.produtoDe(i.produtoId)?.nome ?? 'produto'}).`);
        return;
      }
    }
    const dto: PedidoCompraRequest = {
      modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero),
      fornecedorId: fornecedor.id, dataPedido,
      observacoes: observacoes.trim() || undefined,
      condicaoPagamentoId: condicaoPagamentoId || null,
      valorFrete: valorDe(despesas.valorFrete), valorSeguro: valorDe(despesas.valorSeguro), outrasDespesas: valorDe(despesas.outrasDespesas),
      itens: lista.itens.map(i => ({
        produtoId: Number(i.produtoId),
        classificacaoContaId: Number(i.classificacaoContaId),
        quantidade: Number(i.quantidade),
        valorUnitario: Number(i.valorUnitario),
        descontoPercentual: calcularItem(i).descontoPercentual,
      })),
    };
    setSalvando(true);
    setErro('');
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

  const sc = situacaoCfg[situacao ?? 'ABERTA'];

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={pageTitle}>{somenteLeitura ? 'Pedido de Compra' : (isNovo ? 'Novo Pedido de Compra' : 'Editar Pedido de Compra')}</h2>
          <p style={pageSubtitle}>O pedido é identificado por Modelo + Série + Número + Fornecedor</p>
        </div>
        <span style={{ backgroundColor: sc.bg, color: sc.color, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
          {sc.label.toUpperCase()}
        </span>
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
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Número *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="Ex: 1001" value={chave.numero}
              onChange={e => { setChave({ ...chave, numero: e.target.value }); setErroChave(''); }} disabled={chaveValidada} />
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Fornecedor *</label>
            <CampoBusca valor={fornecedor ? `#${fornecedor.id} — ${fornecedor.nome}` : ''} placeholder="Clique para buscar o fornecedor"
              disabled={chaveValidada} onBuscar={() => setBuscandoFornecedor(true)} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end' }}>
            {!chaveValidada && (
              <button type="button" onClick={() => validarChave()} disabled={validando}
                style={{ ...btnPrimary, padding: '10px 16px', width: '100%', opacity: validando ? 0.6 : 1 }}>
                {validando ? 'Validando...' : 'Validar chave'}
              </button>
            )}
          </div>
        </div>
        {erroChave && <p style={{ ...erroBanner, marginTop: -8 }}>{erroChave}</p>}
        {chaveValidada ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8, flexWrap: 'wrap' }}>
            <span style={{ color: '#2D6A4F', fontWeight: 600, fontSize: 14 }}>
              ✓ Pedido {chave.numero}/{chave.serie} (modelo {chave.modelo}) — Fornecedor: {fornecedor?.nome}
            </span>
            {isNovo && (
              <button type="button" onClick={() => setChaveValidada(false)} disabled={lista.itens.length > 0}
                title={lista.itens.length > 0 ? 'Remova os produtos do pedido para poder trocar a chave' : ''}
                style={{ ...btnCancel, padding: '6px 14px', fontSize: 12, opacity: lista.itens.length > 0 ? 0.5 : 1, cursor: lista.itens.length > 0 ? 'not-allowed' : 'pointer' }}>
                Trocar chave
              </button>
            )}
          </div>
        ) : (
          <p style={{ color: '#8B6E63', fontSize: 13, fontStyle: 'italic', marginTop: -8 }}>
            Informe Modelo, Série e Número, escolha o fornecedor e valide a chave para liberar o restante do formulário.
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
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Situação</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: sc.color, fontWeight: 700 }} value={sc.label} disabled />
            {isNovo && <p style={dica}>Todo pedido novo nasce Aberto.</p>}
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Condição de Pagamento</label>
            <select style={sel} value={condicaoPagamentoId} disabled={!formLiberado}
              onChange={e => { setCondicaoPagamentoId(e.target.value ? Number(e.target.value) : ''); setErro(''); }}>
              <option value="">Selecione</option>
              {condicoes.filter(c => c.ativo !== false || c.id === condicaoPagamentoId)
                .map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
            </select>
            {condicaoDoFornecedor != null && condicaoPagamentoId === condicaoDoFornecedor && (
              <p style={dica}>Preenchida a partir do cadastro do fornecedor. Pode ser alterada.</p>
            )}
          </div>
        </div>

        {!somenteLeitura && (<>
          <SectionHeader label="Adicionar Produto" />
          <PainelProduto
            item={lista.novoItem} produtos={produtos} classificacoes={classificacoes}
            classificacaoTravada={false} desabilitado={!formLiberado} editando={lista.editingKey != null} erro={lista.erroItem}
            onProduto={id => lista.selecionarProduto(id)} onMudar={lista.mudarNovoItem}
            onAdicionar={lista.adicionarOuAtualizar} onCancelarEdicao={lista.cancelarEdicao}
          />
        </>)}

        <SectionHeader label="Produtos do Pedido" />
        <TabelaItens
          itens={lista.itens} produtos={produtos} classificacoes={classificacoes} editavel={formLiberado}
          vazio="Nenhum produto adicionado"
          extras={[{ titulo: 'Recebido', render: c => recebidos[Number(c.item.produtoId)] ?? 0 }]}
          onEditar={lista.editar} onRemover={lista.remover} onTrocarClassificacao={lista.trocarClassificacao}
        />

        <SectionHeader label="Observações" />
        <div style={{ marginBottom: 8 }}>
          <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} maxLength={500}
            placeholder="Observações sobre o pedido..." value={observacoes}
            onChange={e => setObservacoes(e.target.value)} disabled={!formLiberado} />
        </div>

        <SectionHeader label="Totais do Pedido" />
        <BlocoTotais itens={lista.itens} despesas={despesas} desabilitado={!formLiberado} rotuloTotal="Valor Total da Compra"
          onMudar={changes => { setDespesas(prev => ({ ...prev, ...changes })); setErro(''); }} />

        <div style={{ display: 'flex', gap: 12 }}>
          {!somenteLeitura && (
            <button onClick={salvar} disabled={salvando} style={{ ...btnPrimary, opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          )}
          <button onClick={() => navigate('/pedidos-compra')} style={btnCancel}>{somenteLeitura ? 'Fechar' : 'Cancelar'}</button>
        </div>
      </div>

      {buscandoFornecedor && (
        <BuscarFornecedorModal onSelecionar={aoSelecionarFornecedor} onClose={() => setBuscandoFornecedor(false)} />
      )}
    </div>
  );
}
