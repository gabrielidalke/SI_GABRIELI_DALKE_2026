import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  notaEntradaService, mensagemDeErro, caminhoTelaNota,
  type NotaEntradaChave, type NotaEntradaRequest, type PedidoRef, type SituacaoNota,
} from '../../services/notaEntradaService';
import { pedidoCompraService, type PedidoCompra } from '../../services/pedidoCompraService';
import { condicaoPagamentoService, type CondicaoPagamento, type ParcelaPrevia } from '../../services/condicaoPagamentoService';
import { classificacaoContaService, type ClassificacaoConta } from '../../services/classificacaoContaService';
import { produtoService, type Produto } from '../../services/produtoService';
import type { Fornecedor } from '../../services/fornecedorService';
import BuscarPedidoModal from '../../components/BuscarPedidoModal';
import CampoBusca from '../../components/CampoBusca';
import { BuscarFornecedorModal, BuscarTransportadoraModal } from '../../components/BuscaCadastros';
import { PainelProduto, TabelaItens, BlocoTotais } from '../../components/ItensCompra';
import { useItensCompra } from '../../utils/useItensCompra';
import {
  calcularItem, dataBR, despesasVazias, fmt, hojeISO, inteiroPositivo, somar, totalGeral, valorDe,
  type Despesas, type ItemCalculado,
} from '../../utils/itensCompra';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle, th, erroBanner, btnPrimary, btnCancel } from '../../styles/theme';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };
// Modelo | Série | Número | Fornecedor | Emissão | Chegada (as datas ficam ao lado do fornecedor)
const linhaChave: CSSProperties = {
  display: 'grid', gap: 16, marginBottom: 16,
  gridTemplateColumns: 'minmax(70px,0.8fr) minmax(70px,0.8fr) minmax(100px,1.2fr) minmax(200px,3fr) minmax(140px,1.5fr) minmax(140px,1.5fr)',
};
const dicaErro: CSSProperties = { fontSize: 11, color: '#721C24', marginTop: 4, marginBottom: 0 };
const dica: CSSProperties = { fontSize: 11, color: '#8B6E63', marginTop: 4, marginBottom: 0 };
const aviso: CSSProperties = { backgroundColor: '#FFF3CD', color: '#856404', padding: '10px 14px', borderRadius: 8, fontSize: 13 };
const PLACA = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/;

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>
      {label}
    </h3>
  </div>
);

const textoValor = (v?: number | null) => (v ? String(v) : '');

interface Parcelas {
  linhas: ParcelaPrevia[];
  assinatura: string; // condição|total|emissão usados no cálculo: se mudar, a prévia ficou velha
}

export default function NotaEntradaForm() {
  const params = useParams();
  const navigate = useNavigate();
  const topoRef = useRef<HTMLDivElement>(null);

  const isNovo = !params.modelo;
  const chaveEdicao: NotaEntradaChave | null = isNovo ? null : {
    modelo: Number(params.modelo), serie: Number(params.serie),
    numero: Number(params.numero), fornecedorId: Number(params.fornecedorId),
  };

  // chave da nota
  const [chave, setChave] = useState({ modelo: '', serie: '', numero: '' });
  const [fornecedor, setFornecedor] = useState<{ id: number; nome: string } | null>(null);
  const [chaveValidada, setChaveValidada] = useState(false);
  const [erroChave, setErroChave] = useState('');
  const [validando, setValidando] = useState(false);

  // popups
  const [buscandoPedido, setBuscandoPedido] = useState(false);
  const [buscandoFornecedor, setBuscandoFornecedor] = useState(false);
  const [buscandoTransportadora, setBuscandoTransportadora] = useState(false);

  // pedido de compra (opcional)
  const [pedido, setPedido] = useState<PedidoRef | null>(null);
  const [dataPedido, setDataPedido] = useState(''); // a emissão da nota não pode ser anterior a ela
  const [avisoPedido, setAvisoPedido] = useState('');

  const [form, setForm] = useState({
    dataEmissao: '', dataChegada: '', tipoFrete: '' as '' | 'CIF' | 'FOB',
    condicaoPagamentoId: '' as number | '', placaVeiculo: '', observacoes: '',
  });
  const [transportadora, setTransportadora] = useState<{ id: number; nome: string } | null>(null);
  const [despesas, setDespesas] = useState<Despesas>(despesasVazias);
  const [origemCondicao, setOrigemCondicao] = useState<{ id: number; de: 'fornecedor' | 'pedido' } | null>(null);
  const [classificacoesOriginais, setClassificacoesOriginais] = useState<Record<number, number>>({});

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [classificacoes, setClassificacoes] = useState<ClassificacaoConta[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const lista = useItensCompra(produtos);
  // regra da nota: depois que ela tem produtos, a chave não pode mais ser trocada
  const podeTrocarChave = isNovo && chaveValidada && lista.itens.length === 0;

  const [parcelas, setParcelas] = useState<Parcelas | null>(null);
  const [gerandoParcelas, setGerandoParcelas] = useState(false);
  const [erroParcelas, setErroParcelas] = useState('');

  const [situacao, setSituacao] = useState<SituacaoNota | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(!isNovo);
  const [salvando, setSalvando] = useState(false);

  const somenteLeitura = situacao === 'CONFERIDA';
  const formLiberado = chaveValidada && !somenteLeitura;
  const hoje = hojeISO();

  const mostrarErro = (msg: string) => {
    setErro(msg);
    topoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // limpa o erro ao editar, para uma mensagem antiga não ficar na tela
  const setCampo = (changes: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...changes }));
    setErro('');
  };

  useEffect(() => {
    Promise.all([
      produtoService.listar(),
      classificacaoContaService.listar(),
      condicaoPagamentoService.listar(),
    ]).then(([p, c, cp]) => {
      setProdutos(p.data);
      setClassificacoes(c.data);
      setCondicoes(cp.data);
    }).catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os cadastros de apoio.')));
  }, []);

  useEffect(() => {
    if (!chaveEdicao) return;
    notaEntradaService.buscar(chaveEdicao).then(r => {
      const n = r.data;
      setSituacao(n.situacao);
      setChave({ modelo: String(n.modelo), serie: String(n.serie), numero: String(n.numero) });
      setFornecedor({ id: n.fornecedor.id, nome: n.fornecedor.nome ?? '' });
      setChaveValidada(true);
      setPedido(n.pedido ?? null);
      if (n.pedido) {
        pedidoCompraService.buscar({ ...n.pedido, fornecedorId: n.fornecedor.id })
          .then(p => setDataPedido(p.data.dataPedido))
          .catch(() => { /* sem a data, o servidor ainda valida ao salvar */ });
      }
      setForm({
        dataEmissao: n.dataEmissao, dataChegada: n.dataChegada ?? '', tipoFrete: n.tipoFrete ?? '',
        condicaoPagamentoId: n.condicaoPagamento?.id ?? '',
        placaVeiculo: n.placaVeiculo ?? '', observacoes: n.observacoes ?? '',
      });
      setTransportadora(n.transportadora ? { id: n.transportadora.id, nome: n.transportadora.nome } : null);
      setDespesas({ valorFrete: textoValor(n.valorFrete), valorSeguro: textoValor(n.valorSeguro), outrasDespesas: textoValor(n.outrasDespesas) });
      const originais: Record<number, number> = {};
      n.itens.forEach(i => { originais[i.produtoId] = i.classificacaoContaId; });
      setClassificacoesOriginais(originais);
      lista.carregar(n.itens.map(i => ({
        produtoId: i.produtoId, classificacaoContaId: i.classificacaoContaId,
        quantidade: String(i.quantidade), valorUnitario: String(i.valorUnitario),
        descontoModo: 'PERCENTUAL' as const, descontoInput: textoValor(i.descontoPercentual), persistido: true,
      })));
      setCarregando(false);
      // nota conferida: mostra direto as parcelas que viraram contas a pagar
      if (n.situacao === 'CONFERIDA' && n.condicaoPagamento) {
        condicaoPagamentoService.previaParcelas(n.condicaoPagamento.id, n.valorTotal, n.dataEmissao)
          .then(p => setParcelas({ linhas: p.data, assinatura: `${n.condicaoPagamento!.id}|${n.valorTotal}|${n.dataEmissao}` }))
          .catch(() => { /* a prévia é só informativa */ });
      }
    }).catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar a nota de entrada.')); setCarregando(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.modelo, params.serie, params.numero, params.fornecedorId]);

  // ------------------------------------------------------------------ chave

  const validarChave = async (forn = fornecedor) => {
    setErroChave('');
    if (!inteiroPositivo(chave.modelo)) { setErroChave('Informe o Modelo (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.serie)) { setErroChave('Informe a Série (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.numero)) { setErroChave('Informe o Número da nota (número inteiro maior que zero).'); return; }
    if (!forn) { setErroChave('Selecione o fornecedor.'); return; }

    setValidando(true);
    try {
      const existe = await notaEntradaService.existe({
        modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero), fornecedorId: forn.id,
      });
      if (existe.data.existe) {
        setErroChave('Já existe uma nota de entrada com este Modelo / Série / Número para este fornecedor. Abra-a na lista para consultar ou editar.');
        return;
      }
      setChaveValidada(true);
    } catch (e) {
      setErroChave(mensagemDeErro(e, 'Não foi possível validar a chave.'));
    } finally {
      setValidando(false);
    }
  };

  const chavePreenchida = () => inteiroPositivo(chave.modelo) && inteiroPositivo(chave.serie) && inteiroPositivo(chave.numero);

  // A condição de pagamento é sugerida (pelo fornecedor ou pelo pedido) só se a pessoa não escolheu outra
  const sugerirCondicao = (id: number | undefined, de: 'fornecedor' | 'pedido') => {
    if (id == null) return;
    if (form.condicaoPagamentoId === '' || form.condicaoPagamentoId === origemCondicao?.id) {
      setForm(prev => ({ ...prev, condicaoPagamentoId: id }));
      setOrigemCondicao({ id, de });
    }
  };

  const aoSelecionarFornecedor = (f: Fornecedor) => {
    setBuscandoFornecedor(false);
    const escolhido = { id: f.id, nome: f.fornecedor };
    setFornecedor(escolhido);
    setErroChave('');
    sugerirCondicao(f.condicaoPagamento?.id, 'fornecedor');
    if (chavePreenchida()) validarChave(escolhido);
  };

  const trocarChave = () => { setChaveValidada(false); setErroChave(''); };

  // ------------------------------------------------------------------ pedido de compra

  const aoSelecionarPedido = (p: PedidoCompra) => {
    setBuscandoPedido(false);
    const pendentes = p.itens.filter(i => i.quantidadeRecebida < i.quantidade);
    if (lista.itens.length > 0 && !confirm('Substituir os produtos atuais pelos produtos ainda não recebidos do pedido?')) return;
    if (p.fornecedor.ativo === false) { setErroChave('O fornecedor deste pedido está inativo.'); return; }

    setPedido({ modelo: p.modelo, serie: p.serie, numero: p.numero });
    setDataPedido(p.dataPedido);
    const doPedido = { id: p.fornecedor.id, nome: p.fornecedor.nome ?? '' };
    setFornecedor(doPedido);
    sugerirCondicao(p.condicaoPagamento?.id, 'pedido');
    // frete/seguro/outras do pedido só valem para a primeira entrega
    if (p.situacao === 'ABERTA') {
      setDespesas({ valorFrete: textoValor(p.valorFrete), valorSeguro: textoValor(p.valorSeguro), outrasDespesas: textoValor(p.outrasDespesas) });
    }
    // os produtos vêm prontos: só o que ainda falta receber, com o preço, desconto e classificação do pedido
    lista.carregar(pendentes.map(i => ({
      produtoId: i.produtoId,
      classificacaoContaId: classificacoesOriginais[i.produtoId] ?? i.classificacaoContaId ?? '',
      quantidade: String(Number((i.quantidade - i.quantidadeRecebida).toFixed(3))),
      valorUnitario: String(i.valorUnitario),
      descontoModo: 'PERCENTUAL' as const, descontoInput: textoValor(i.descontoPercentual), persistido: false,
    })));
    const semClassificacao = pendentes.filter(i => !i.classificacaoContaId && classificacoesOriginais[i.produtoId] == null).length;
    setAvisoPedido(
      `${pendentes.length} produto(s) carregado(s) do pedido ${p.modelo}/${p.serie}/${p.numero}. Confira as quantidades da nota.`
      + (semClassificacao ? ` ${semClassificacao} item(ns) sem classificação da conta: escolha na lista abaixo.` : ''),
    );
    setErro('');
    setParcelas(null);
    if (!chaveValidada && chavePreenchida()) validarChave(doPedido);
  };

  const removerVinculoPedido = () => { setPedido(null); setDataPedido(''); setAvisoPedido(''); };

  // ------------------------------------------------------------------ totais (prévia; o servidor recalcula ao salvar)

  const custoAdicional = valorDe(despesas.valorFrete) + valorDe(despesas.valorSeguro) + valorDe(despesas.outrasDespesas);
  const totalLiquido = somar(lista.itens.map(calcularItem)).liquido;
  const totalNota = totalGeral(lista.itens, despesas);
  const rateioDoItem = (liquido: number) =>
    totalLiquido > 0 ? custoAdicional * (liquido / totalLiquido) : (lista.itens.length > 0 ? custoAdicional / lista.itens.length : 0);
  const custoFinalDoItem = (c: ItemCalculado) => {
    const q = Number(c.item.quantidade) || 0;
    return q > 0 ? (c.liquido + rateioDoItem(c.liquido)) / q : 0;
  };

  // ------------------------------------------------------------------ parcelas

  const assinaturaAtual = `${form.condicaoPagamentoId || 'avista'}|${totalNota}|${form.dataEmissao}`;
  const parcelasDesatualizadas = parcelas != null && !somenteLeitura && parcelas.assinatura !== assinaturaAtual;

  const gerarParcelas = async () => {
    setErroParcelas('');
    if (!form.dataEmissao) { setErroParcelas('Informe a data de emissão para gerar as parcelas.'); return; }
    if (totalNota <= 0) { setErroParcelas('Adicione os produtos: o valor total da nota precisa ser maior que zero.'); return; }
    if (form.condicaoPagamentoId === '') {
      // sem condição: uma conta só, à vista, vencendo na emissão (igual ao que o sistema faz na confirmação)
      setParcelas({
        linhas: [{ numero: 1, diasVencimento: 0, percentual: 100, formaPagamento: null, dataVencimento: form.dataEmissao, valor: totalNota }],
        assinatura: assinaturaAtual,
      });
      return;
    }
    setGerandoParcelas(true);
    try {
      const r = await condicaoPagamentoService.previaParcelas(form.condicaoPagamentoId, totalNota, form.dataEmissao);
      setParcelas({ linhas: r.data, assinatura: assinaturaAtual });
    } catch (e) {
      setErroParcelas(mensagemDeErro(e, 'Erro ao gerar as parcelas.'));
    } finally {
      setGerandoParcelas(false);
    }
  };

  // ------------------------------------------------------------------ validações de data/placa (ao vivo)

  const erroEmissao = !form.dataEmissao ? ''
    : form.dataEmissao > hoje ? 'Data de emissão não pode ser posterior à data atual.'
    : pedido && dataPedido && form.dataEmissao < dataPedido
      ? `Data de emissão não pode ser anterior à data do Pedido de Compra (${dataBR(dataPedido)}).` : '';
  const erroChegada = form.dataChegada
    ? (form.dataEmissao && form.dataChegada < form.dataEmissao ? 'Data de chegada não pode ser anterior à data de emissão.'
      : form.dataChegada > hoje ? 'Data de chegada não pode ser posterior à data atual.' : '')
    : '';
  const erroPlaca = form.placaVeiculo && !PLACA.test(form.placaVeiculo) ? 'Placa inválida (use ABC-1234 ou ABC1D23).' : '';

  // ------------------------------------------------------------------ salvar

  const montarRequisicao = (): NotaEntradaRequest | null => {
    if (!chaveValidada || !fornecedor) { mostrarErro('Valide a chave da nota (Modelo, Série, Número e Fornecedor) antes de salvar.'); return null; }
    if (!form.dataEmissao) { mostrarErro('Data de emissão é obrigatória.'); return null; }
    if (erroEmissao) { mostrarErro(erroEmissao); return null; }
    if (erroChegada) { mostrarErro(erroChegada); return null; }
    if (erroPlaca) { mostrarErro(erroPlaca); return null; }
    for (const [idx, i] of lista.itens.entries()) {
      if (!i.classificacaoContaId) {
        mostrarErro(`Selecione a classificação da conta do item ${idx + 1} (${lista.produtoDe(i.produtoId)?.nome ?? 'produto'}).`);
        return null;
      }
    }
    return {
      modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero),
      fornecedorId: fornecedor.id,
      dataEmissao: form.dataEmissao,
      dataChegada: form.dataChegada || undefined,
      tipoFrete: form.tipoFrete || undefined,
      valorFrete: valorDe(despesas.valorFrete), valorSeguro: valorDe(despesas.valorSeguro), outrasDespesas: valorDe(despesas.outrasDespesas),
      condicaoPagamentoId: form.condicaoPagamentoId || null,
      transportadoraId: transportadora?.id ?? null,
      placaVeiculo: form.placaVeiculo.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
      pedidoNumero: pedido?.numero ?? null, pedidoSerie: pedido?.serie ?? null, pedidoModelo: pedido?.modelo ?? null,
      itens: lista.itens.map(i => ({
        produtoId: Number(i.produtoId),
        classificacaoContaId: Number(i.classificacaoContaId),
        quantidade: Number(i.quantidade),
        valorUnitario: Number(i.valorUnitario),
        descontoPercentual: calcularItem(i).descontoPercentual,
      })),
    };
  };

  const salvar = async (confirmarDepois: boolean) => {
    const dto = montarRequisicao();
    if (!dto) return;
    if (confirmarDepois && !confirm('Salvar e confirmar a nota?\n\nA confirmação dá entrada no estoque e gera as contas a pagar. Depois disso a nota não poderá mais ser editada nem excluída.')) return;

    setSalvando(true);
    setErro('');
    const chaveSalva: NotaEntradaChave = { modelo: dto.modelo, serie: dto.serie, numero: dto.numero, fornecedorId: dto.fornecedorId };
    try {
      if (chaveEdicao) await notaEntradaService.atualizar(chaveEdicao, dto);
      else await notaEntradaService.criar(dto);
    } catch (e) {
      mostrarErro(mensagemDeErro(e, 'Erro ao salvar a nota.'));
      setSalvando(false);
      return;
    }

    if (confirmarDepois) {
      try {
        await notaEntradaService.confirmar(chaveSalva);
      } catch (e) {
        // a nota foi salva (PENDENTE); leva para a edição dela para a pessoa corrigir e tentar de novo
        if (isNovo) navigate(caminhoTelaNota(chaveSalva), { replace: true });
        mostrarErro(`A nota foi salva como PENDENTE, mas não foi confirmada: ${mensagemDeErro(e, 'erro ao confirmar.')}`);
        setSalvando(false);
        return;
      }
    }
    navigate('/notas-entrada');
  };

  // ------------------------------------------------------------------ tela

  if (carregando) return <div style={{ padding: 32 }}>Carregando...</div>;

  const titulo = somenteLeitura ? 'Nota de Entrada (conferida)' : (isNovo ? 'Nova Nota de Entrada' : 'Editar Nota de Entrada');
  const classifTravadaNoPainel = lista.novoItem.produtoId !== '' && (
    classificacoesOriginais[lista.novoItem.produtoId] !== undefined
    || (lista.editingKey != null && lista.itens.find(i => i._key === lista.editingKey)?.persistido === true));
  const chaveBloqueada = chaveValidada || somenteLeitura;
  const totalParcelas = parcelas ? parcelas.linhas.reduce((s, p) => s + p.valor, 0) : 0;

  return (
    <div ref={topoRef} style={{ padding: 32, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={pageTitle}>{titulo}</h2>
          <p style={pageSubtitle}>A nota é identificada por Modelo + Série + Número + Fornecedor</p>
        </div>
        {situacao && (
          <span style={{
            backgroundColor: somenteLeitura ? '#D4EDDA' : '#FFF3CD', color: somenteLeitura ? '#2D6A4F' : '#856404',
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700,
          }}>{somenteLeitura ? 'CONFERIDA' : 'PENDENTE'}</span>
        )}
      </div>

      <div style={{ ...card, padding: 32 }}>
        {erro && <p style={erroBanner}>{erro}</p>}
        {somenteLeitura && (
          <p style={{ backgroundColor: '#D4EDDA', color: '#2D6A4F', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginTop: 0 }}>
            Nota conferida: a entrada já foi efetivada no estoque e as contas a pagar foram geradas. Ela não pode mais ser editada nem excluída.
          </p>
        )}

        {/* Identificação: chave + datas */}
        <SectionHeader label="Identificação da Nota" />
        <div style={linhaChave}>
          <div>
            <label style={labelStyle}>Modelo *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="55" value={chave.modelo}
              onChange={e => { setChave({ ...chave, modelo: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div>
            <label style={labelStyle}>Série *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="1" value={chave.serie}
              onChange={e => { setChave({ ...chave, serie: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div>
            <label style={labelStyle}>Número *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="12345" value={chave.numero}
              onChange={e => { setChave({ ...chave, numero: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div>
            <label style={labelStyle}>Fornecedor *</label>
            <CampoBusca valor={fornecedor ? `#${fornecedor.id} — ${fornecedor.nome}` : ''} placeholder="Clique para buscar o fornecedor"
              disabled={chaveBloqueada || pedido != null} onBuscar={() => setBuscandoFornecedor(true)} />
            {pedido != null && !chaveBloqueada && <p style={dica}>Vem do pedido de compra vinculado.</p>}
          </div>
          <div>
            <label style={labelStyle}>Data de Emissão *</label>
            <input type="date" min={(pedido && dataPedido) || undefined} max={hoje} style={inputStyle} value={form.dataEmissao}
              onChange={e => setCampo({ dataEmissao: e.target.value })} disabled={somenteLeitura} />
            {erroEmissao
              ? <p style={dicaErro}>{erroEmissao}</p>
              : pedido && dataPedido && !somenteLeitura && <p style={dica}>A partir de {dataBR(dataPedido)} (data do pedido).</p>}
          </div>
          <div>
            <label style={labelStyle}>Data de Chegada</label>
            <input type="date" min={form.dataEmissao || undefined} max={hoje} style={inputStyle} value={form.dataChegada}
              onChange={e => setCampo({ dataChegada: e.target.value })} disabled={somenteLeitura} />
            {erroChegada
              ? <p style={dicaErro}>{erroChegada}</p>
              : !somenteLeitura && <p style={dica}>Vazia = data da confirmação.</p>}
          </div>
        </div>
        {erroChave && <p style={erroBanner}>{erroChave}</p>}

        {chaveValidada ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#2D6A4F', fontWeight: 600, fontSize: 14 }}>
              ✓ Nota {chave.numero}/{chave.serie} (modelo {chave.modelo}) — Fornecedor: {fornecedor?.nome}
            </span>
            {!somenteLeitura && isNovo && (
              <button type="button" onClick={trocarChave} disabled={!podeTrocarChave}
                title={podeTrocarChave ? '' : 'Remova os produtos da nota para poder trocar a chave'}
                style={{ ...btnCancel, padding: '6px 14px', fontSize: 12, opacity: podeTrocarChave ? 1 : 0.5, cursor: podeTrocarChave ? 'pointer' : 'not-allowed' }}>
                Trocar chave
              </button>
            )}
          </div>
        ) : !somenteLeitura && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => validarChave()} disabled={validando}
              style={{ ...btnPrimary, padding: '8px 20px', opacity: validando ? 0.6 : 1 }}>
              {validando ? 'Validando...' : 'Validar chave'}
            </button>
            <span style={{ color: '#8B6E63', fontSize: 13, fontStyle: 'italic' }}>
              Informe Modelo, Série e Número, escolha o fornecedor (ou um pedido de compra) e valide a chave para liberar o restante.
              Depois que a nota tiver produtos, a chave não pode mais ser trocada.
            </span>
          </div>
        )}

        {/* Pedido de compra */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!somenteLeitura && (
            <button type="button" onClick={() => setBuscandoPedido(true)} style={{ ...btnCancel, padding: '8px 18px' }}>
              🔍 Buscar Pedido de Compra
            </button>
          )}
          {pedido ? (
            <>
              <span style={{ fontSize: 13, color: '#3D2B1F' }}>
                Vinculada ao Pedido de Compra <strong>{pedido.modelo}/{pedido.serie}/{pedido.numero}</strong>
              </span>
              {!somenteLeitura && (
                <button type="button" onClick={removerVinculoPedido} style={{ background: 'none', border: 'none', color: '#C97B6B', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                  remover vínculo
                </button>
              )}
            </>
          ) : !somenteLeitura && (
            <span style={{ fontSize: 12, color: '#8B6E63' }}>Opcional: ao escolher um pedido, o fornecedor e os produtos são preenchidos automaticamente.</span>
          )}
        </div>
        {avisoPedido && <p style={{ ...aviso, marginBottom: 0 }}>{avisoPedido}</p>}

        {/* Dados da nota */}
        <SectionHeader label="Dados da Nota" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Tipo de Frete</label>
            <select style={sel} value={form.tipoFrete} onChange={e => setCampo({ tipoFrete: e.target.value as '' | 'CIF' | 'FOB' })} disabled={!formLiberado}>
              <option value="">Selecione</option>
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Condição de Pagamento</label>
            <select style={sel} value={form.condicaoPagamentoId}
              onChange={e => setCampo({ condicaoPagamentoId: e.target.value ? Number(e.target.value) : '' })} disabled={!formLiberado}>
              <option value="">Selecione (à vista)</option>
              {condicoes.filter(c => c.ativo !== false || c.id === form.condicaoPagamentoId)
                .map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
            </select>
            {origemCondicao != null && form.condicaoPagamentoId === origemCondicao.id && !somenteLeitura && (
              <p style={dica}>Preenchida a partir do {origemCondicao.de}. Pode ser alterada.</p>
            )}
          </div>
          <div style={{ gridColumn: 'span 5' }}>
            <label style={labelStyle}>Transportadora</label>
            <CampoBusca valor={transportadora ? `#${transportadora.id} — ${transportadora.nome}` : ''} placeholder="Clique para buscar a transportadora"
              disabled={!formLiberado} onBuscar={() => setBuscandoTransportadora(true)}
              onLimpar={() => { setTransportadora(null); setErro(''); }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Placa do Veículo</label>
            <input style={inputStyle} placeholder="ABC1D23" maxLength={8} value={form.placaVeiculo}
              onChange={e => setCampo({ placaVeiculo: e.target.value.toUpperCase() })} disabled={!formLiberado} />
            {erroPlaca && <p style={dicaErro}>{erroPlaca}</p>}
          </div>
        </div>

        {/* Adicionar produto */}
        {!somenteLeitura && (<>
          <SectionHeader label="Adicionar Produto" />
          <PainelProduto
            item={lista.novoItem} produtos={produtos} classificacoes={classificacoes}
            classificacaoTravada={classifTravadaNoPainel} desabilitado={!formLiberado}
            editando={lista.editingKey != null} erro={lista.erroItem}
            onProduto={id => lista.selecionarProduto(id, id !== '' ? classificacoesOriginais[id] : undefined)}
            onMudar={lista.mudarNovoItem} onAdicionar={lista.adicionarOuAtualizar} onCancelarEdicao={lista.cancelarEdicao}
          />
        </>)}

        {/* Lista de produtos */}
        <SectionHeader label="Produtos da Nota" />
        <TabelaItens
          itens={lista.itens} produtos={produtos} classificacoes={classificacoes} editavel={formLiberado}
          vazio="Nenhum produto adicionado"
          extras={[
            { titulo: 'Rateio (R$)', render: c => fmt(rateioDoItem(c.liquido)), total: fmt(custoAdicional) },
            { titulo: 'Custo Final (unit.)', render: c => fmt(custoFinalDoItem(c)) },
          ]}
          onEditar={lista.editar} onRemover={lista.remover} onTrocarClassificacao={lista.trocarClassificacao}
        />
        {lista.itens.length === 0 && formLiberado && (
          <p style={{ ...dica, marginBottom: 12 }}>A nota pode ser salva sem produtos, mas só pode ser confirmada quando tiver pelo menos um.</p>
        )}
        {formLiberado && lista.itens.length > 0 && (
          <p style={{ ...dica, marginBottom: 12 }}>Rateio = frete + seguro + outras despesas divididos pelo valor de cada item. É uma prévia; ao salvar, o sistema recalcula tudo.</p>
        )}

        {/* Custos e totais */}
        <SectionHeader label="Custos e Totais" />
        <BlocoTotais itens={lista.itens} despesas={despesas} desabilitado={!formLiberado} rotuloTotal="Valor Total da Nota"
          onMudar={changes => { setDespesas(prev => ({ ...prev, ...changes })); setErro(''); }} />

        {/* Parcelas */}
        <SectionHeader label={somenteLeitura ? 'Parcelas (contas a pagar geradas)' : 'Parcelas'} />
        {!somenteLeitura && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <button type="button" onClick={gerarParcelas} disabled={!formLiberado || gerandoParcelas}
              style={{ ...btnPrimary, padding: '8px 20px', opacity: !formLiberado || gerandoParcelas ? 0.6 : 1 }}>
              {gerandoParcelas ? 'Gerando...' : 'Gerar Parcelas'}
            </button>
            <span style={{ fontSize: 12, color: '#8B6E63' }}>
              Calcula as parcelas pela condição de pagamento, a data de emissão e o valor total. As contas a pagar são criadas com estas parcelas quando a nota é confirmada.
            </span>
          </div>
        )}
        {erroParcelas && <p style={erroBanner}>{erroParcelas}</p>}
        {parcelasDesatualizadas && (
          <p style={{ ...aviso, marginTop: 0 }}>Os valores da nota mudaram depois que as parcelas foram geradas. Clique em Gerar Parcelas de novo.</p>
        )}
        {parcelas && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, opacity: parcelasDesatualizadas ? 0.5 : 1 }}>
            <thead>
              <tr style={{ backgroundColor: '#FDF0E8' }}>
                {['Parcela', 'Dias', 'Vencimento', 'Forma de Pagamento', '%', 'Valor'].map(h => <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {parcelas.linhas.map(p => (
                <tr key={p.numero} style={{ borderTop: '1px solid #F0E6DC' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>{p.numero}/{parcelas.linhas.length}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{p.diasVencimento}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{dataBR(p.dataVencimento)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{p.formaPagamento || 'À vista'}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{Number(p.percentual).toFixed(2)}%</td>
                  <td style={{ padding: '8px 12px', fontSize: 14, fontWeight: 600, color: '#C97B6B' }}>{fmt(p.valor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #E8D5CC', backgroundColor: '#FDF0E8' }}>
                <td colSpan={5} style={{ padding: '8px 12px', fontWeight: 700, fontSize: 13 }}>Total</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, fontSize: 14, color: '#C97B6B' }}>{fmt(totalParcelas)}</td>
              </tr>
            </tfoot>
          </table>
        )}
        {!parcelas && somenteLeitura && <p style={dica}>Sem condição de pagamento: uma conta à vista, vencendo na data de emissão.</p>}

        {/* Observações */}
        <SectionHeader label="Observações" />
        <div style={{ marginBottom: 32 }}>
          <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} maxLength={500}
            placeholder="Observações sobre a nota..." value={form.observacoes}
            onChange={e => setCampo({ observacoes: e.target.value })} disabled={!formLiberado} />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {!somenteLeitura && (<>
            <button onClick={() => salvar(false)} disabled={salvando} style={{ ...btnPrimary, opacity: salvando ? 0.6 : 1 }}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => salvar(true)} disabled={salvando}
              style={{ ...btnPrimary, backgroundColor: '#2D6A4F', opacity: salvando ? 0.6 : 1 }}>
              Salvar e Confirmar
            </button>
          </>)}
          <button onClick={() => navigate('/notas-entrada')} style={btnCancel}>{somenteLeitura ? 'Fechar' : 'Cancelar'}</button>
        </div>
      </div>

      {buscandoPedido && (
        <BuscarPedidoModal
          fornecedorId={fornecedor?.id ?? null}
          onSelecionar={aoSelecionarPedido}
          onClose={() => setBuscandoPedido(false)}
        />
      )}
      {buscandoFornecedor && (
        <BuscarFornecedorModal onSelecionar={aoSelecionarFornecedor} onClose={() => setBuscandoFornecedor(false)} />
      )}
      {buscandoTransportadora && (
        <BuscarTransportadoraModal
          onSelecionar={t => { setTransportadora({ id: t.id, nome: t.nome }); setBuscandoTransportadora(false); setErro(''); }}
          onClose={() => setBuscandoTransportadora(false)}
        />
      )}
    </div>
  );
}
