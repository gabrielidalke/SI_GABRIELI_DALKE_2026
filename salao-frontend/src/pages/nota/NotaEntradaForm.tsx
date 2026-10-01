import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  notaEntradaService, mensagemDeErro, caminhoTelaNota,
  type NotaEntradaChave, type NotaEntradaRequest, type PedidoRef, type SituacaoNota,
} from '../../services/notaEntradaService';
import type { PedidoCompra } from '../../services/pedidoCompraService';
import { condicaoPagamentoService, type CondicaoPagamento } from '../../services/condicaoPagamentoService';
import { classificacaoContaService, type ClassificacaoConta } from '../../services/classificacaoContaService';
import { produtoService, type Produto } from '../../services/produtoService';
import { transportadoraService, type Transportadora } from '../../services/transportadoraService';
import BuscarPedidoModal from '../../components/BuscarPedidoModal';
import { inputStyle, labelStyle, card, pageTitle, pageSubtitle, th, erroBanner, btnPrimary, btnCancel } from '../../styles/theme';

const API = 'http://localhost:8080/api';
const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 24 };
const dicaErro: CSSProperties = { fontSize: 11, color: '#721C24', marginTop: 4, marginBottom: 0 };
const dica: CSSProperties = { fontSize: 11, color: '#8B6E63', marginTop: 4, marginBottom: 0 };
const PLACA = /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/;

interface FornecedorOpt {
  id: number;
  fornecedor: string;
  ativo: boolean;
  condicaoPagamento?: { id: number; condicao: string };
}

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ borderBottom: '1px solid #E8D5CC', paddingBottom: 8, marginBottom: 20, marginTop: 28 }}>
    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#3D2B1F', margin: 0, fontWeight: 600 }}>
      {label}
    </h3>
  </div>
);

// Data local (toISOString é UTC: à noite no Brasil já seria "amanhã")
const hojeISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const fmt = (v: number) => `R$ ${(v || 0).toFixed(2)}`;
const inteiroPositivo = (t: string) => /^\d+$/.test(t.trim()) && Number(t) > 0;

// Quantidade/preço/desconto ficam como texto enquanto editados: guardar já como number faz o React
// reescrever o valor a cada tecla (o "." do decimal some assim que é digitado).
interface ItemLocal {
  _key: number;
  produtoId: number | '';
  classificacaoContaId: number | '';
  quantidade: string;
  valorUnitario: string;
  descontoModo: 'PERCENTUAL' | 'VALOR';
  descontoInput: string;
  persistido: boolean; // já existia na nota salva: a classificação da conta fica travada
}

function calcularItem(item: ItemLocal) {
  const quantidade = Number(item.quantidade) || 0;
  const valorUnitario = Number(item.valorUnitario) || 0;
  const descontoInput = Number(item.descontoInput) || 0;
  const bruto = quantidade * valorUnitario;
  const descontoPercentual = item.descontoModo === 'PERCENTUAL'
    ? descontoInput
    : (bruto > 0 ? descontoInput / bruto * 100 : 0);
  const descontoValor = item.descontoModo === 'VALOR' ? descontoInput : bruto * descontoInput / 100;
  return { bruto, descontoPercentual, descontoValor, liquido: bruto - descontoValor };
}

const itemVazio = (nextKey: () => number): ItemLocal => ({
  _key: nextKey(), produtoId: '', classificacaoContaId: '', quantidade: '1', valorUnitario: '',
  descontoModo: 'PERCENTUAL', descontoInput: '', persistido: false,
});

export default function NotaEntradaForm() {
  const params = useParams();
  const navigate = useNavigate();
  const keyRef = useRef(0);
  const nextKey = () => ++keyRef.current;
  const topoRef = useRef<HTMLDivElement>(null);

  const isNovo = !params.modelo;
  const chaveEdicao: NotaEntradaChave | null = isNovo ? null : {
    modelo: Number(params.modelo), serie: Number(params.serie),
    numero: Number(params.numero), fornecedorId: Number(params.fornecedorId),
  };

  // chave da nota
  const [chave, setChave] = useState({ modelo: '', serie: '', numero: '' });
  const [fornecedorIdInput, setFornecedorIdInput] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [chaveValidada, setChaveValidada] = useState(false);
  const [erroChave, setErroChave] = useState('');
  const [validando, setValidando] = useState(false);

  // pedido de compra (opcional)
  const [pedido, setPedido] = useState<PedidoRef | null>(null);
  const [buscandoPedido, setBuscandoPedido] = useState(false);

  const [form, setForm] = useState({
    dataEmissao: '', dataChegada: '', tipoFrete: '' as '' | 'CIF' | 'FOB',
    valorFrete: '', valorSeguro: '', outrasDespesas: '',
    condicaoPagamentoId: '' as number | '', transportadoraId: '' as number | '',
    placaVeiculo: '', observacoes: '',
  });
  const [condicaoDoFornecedor, setCondicaoDoFornecedor] = useState<number | null>(null);

  const [itens, setItens] = useState<ItemLocal[]>([]);
  const [novoItem, setNovoItem] = useState<ItemLocal>(itemVazio(nextKey));
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [classificacoesOriginais, setClassificacoesOriginais] = useState<Record<number, number>>({});

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [classificacoes, setClassificacoes] = useState<ClassificacaoConta[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);

  const [situacao, setSituacao] = useState<SituacaoNota | null>(null);
  const [erro, setErro] = useState('');
  const [erroItem, setErroItem] = useState(''); // erro do painel "Adicionar Produto", mostrado junto do botão
  const [carregando, setCarregando] = useState(!isNovo);
  const [salvando, setSalvando] = useState(false);

  const somenteLeitura = situacao === 'CONFERIDA';
  const formLiberado = chaveValidada && !somenteLeitura;
  const podeTrocarChave = isNovo && chaveValidada && itens.length === 0;
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
      transportadoraService.listar(),
    ]).then(([p, c, cp, t]) => {
      setProdutos(p.data);
      setClassificacoes(c.data);
      setCondicoes(cp.data);
      setTransportadoras(t.data);
    }).catch(e => setErro(mensagemDeErro(e, 'Erro ao carregar os cadastros de apoio.')));
  }, []);

  useEffect(() => {
    if (!chaveEdicao) return;
    notaEntradaService.buscar(chaveEdicao).then(r => {
      const n = r.data;
      setSituacao(n.situacao);
      setChave({ modelo: String(n.modelo), serie: String(n.serie), numero: String(n.numero) });
      setFornecedorIdInput(String(n.fornecedor.id));
      setFornecedorNome(n.fornecedor.nome ?? '');
      setChaveValidada(true);
      setPedido(n.pedido ?? null);
      setForm({
        dataEmissao: n.dataEmissao, dataChegada: n.dataChegada ?? '', tipoFrete: n.tipoFrete ?? '',
        valorFrete: String(n.valorFrete), valorSeguro: String(n.valorSeguro), outrasDespesas: String(n.outrasDespesas),
        condicaoPagamentoId: n.condicaoPagamento?.id ?? '', transportadoraId: n.transportadora?.id ?? '',
        placaVeiculo: n.placaVeiculo ?? '', observacoes: n.observacoes ?? '',
      });
      const originais: Record<number, number> = {};
      n.itens.forEach(i => { originais[i.produtoId] = i.classificacaoContaId; });
      setClassificacoesOriginais(originais);
      setItens(n.itens.map(i => ({
        _key: nextKey(), produtoId: i.produtoId, classificacaoContaId: i.classificacaoContaId,
        quantidade: String(i.quantidade), valorUnitario: String(i.valorUnitario),
        descontoModo: 'PERCENTUAL' as const, descontoInput: String(i.descontoPercentual), persistido: true,
      })));
      setCarregando(false);
    }).catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar a nota de entrada.')); setCarregando(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.modelo, params.serie, params.numero, params.fornecedorId]);

  // ------------------------------------------------------------------ chave

  const validarChave = async () => {
    setErroChave('');
    if (!inteiroPositivo(chave.modelo)) { setErroChave('Informe o Modelo (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.serie)) { setErroChave('Informe a Série (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(chave.numero)) { setErroChave('Informe o Número da nota (número inteiro maior que zero).'); return; }
    if (!inteiroPositivo(fornecedorIdInput)) { setErroChave('Informe o ID do Fornecedor.'); return; }

    setValidando(true);
    try {
      const f = await axios.get<FornecedorOpt>(`${API}/fornecedores/${Number(fornecedorIdInput)}`);
      if (f.data.ativo === false) { setErroChave('Fornecedor inativo. Escolha outro.'); return; }
      const existe = await notaEntradaService.existe({
        modelo: Number(chave.modelo), serie: Number(chave.serie),
        numero: Number(chave.numero), fornecedorId: Number(fornecedorIdInput),
      });
      if (existe.data.existe) {
        setErroChave('Já existe uma nota de entrada com este Modelo / Série / Número para este fornecedor. Abra-a na lista para consultar ou editar.');
        return;
      }
      setFornecedorNome(f.data.fornecedor);
      setChaveValidada(true);
      // A condição de pagamento vem do fornecedor, mas pode ser trocada
      if (f.data.condicaoPagamento && form.condicaoPagamentoId === '') {
        setCondicaoDoFornecedor(f.data.condicaoPagamento.id);
        setForm(prev => ({ ...prev, condicaoPagamentoId: f.data.condicaoPagamento!.id }));
      }
    } catch (e) {
      setErroChave(mensagemDeErro(e, 'Fornecedor não encontrado.'));
    } finally {
      setValidando(false);
    }
  };

  const trocarChave = () => {
    setChaveValidada(false);
    setErroChave('');
    if (!pedido) { setFornecedorNome(''); }
  };

  // ------------------------------------------------------------------ pedido de compra

  const aoSelecionarPedido = (p: PedidoCompra) => {
    setBuscandoPedido(false);
    if (itens.length > 0 && !confirm('Substituir os produtos atuais pelos produtos ainda não recebidos do pedido?')) return;
    setPedido({ modelo: p.modelo, serie: p.serie, numero: p.numero });
    setFornecedorIdInput(String(p.fornecedor.id));
    setFornecedorNome(p.fornecedor.nome ?? '');
    setItens(p.itens
      .filter(i => i.quantidadeRecebida < i.quantidade)
      .map(i => ({
        _key: nextKey(), produtoId: i.produtoId,
        classificacaoContaId: classificacoesOriginais[i.produtoId] ?? '',
        quantidade: String(Number((i.quantidade - i.quantidadeRecebida).toFixed(3))),
        valorUnitario: String(i.valorUnitario),
        descontoModo: 'PERCENTUAL' as const, descontoInput: '', persistido: false,
      })));
    setEditingKey(null);
    setNovoItem(itemVazio(nextKey));
    setErro('');
  };

  // ------------------------------------------------------------------ itens

  const produtoDe = (id: number | '') => produtos.find(p => p.id === id);
  const classificacaoTravada = (produtoId: number | '', key: number | null) =>
    produtoId !== '' && (classificacoesOriginais[produtoId] !== undefined
      || (key != null && itens.find(i => i._key === key)?.persistido === true));

  const onSelecionarProduto = (produtoId: number | '') => {
    const produto = produtoDe(produtoId);
    setErroItem('');
    setNovoItem(prev => {
      // o valor sugerido (preço de custo) acompanha o produto; um valor digitado pela pessoa é respeitado
      const anterior = produtoDe(prev.produtoId);
      const sugerido = prev.valorUnitario === '' || (anterior != null && String(anterior.precoCusto ?? 0) === prev.valorUnitario);
      return {
        ...prev,
        produtoId,
        valorUnitario: sugerido && produto ? String(produto.precoCusto ?? 0) : prev.valorUnitario,
        classificacaoContaId: produtoId !== '' && classificacoesOriginais[produtoId] !== undefined
          ? classificacoesOriginais[produtoId] : prev.classificacaoContaId,
      };
    });
  };

  const adicionarOuAtualizarItem = () => {
    if (!novoItem.produtoId) { setErroItem('Selecione o produto.'); return; }
    if (!novoItem.classificacaoContaId) { setErroItem('Selecione a classificação da conta.'); return; }
    if (!novoItem.quantidade || Number(novoItem.quantidade) <= 0) { setErroItem('Quantidade deve ser maior que zero.'); return; }
    if (novoItem.valorUnitario === '' || Number(novoItem.valorUnitario) < 0) { setErroItem('Valor unitário é obrigatório e não pode ser negativo.'); return; }
    const c = calcularItem(novoItem);
    if (c.descontoPercentual < 0 || c.descontoPercentual > 100) { setErroItem('Desconto deve estar entre 0 e 100%.'); return; }
    if (itens.some(i => i.produtoId === novoItem.produtoId && i._key !== editingKey)) {
      setErroItem('Este produto já foi adicionado à nota. Edite a linha existente em vez de repetir o produto.'); return;
    }
    setErroItem('');
    if (editingKey != null) {
      setItens(prev => prev.map(i => i._key === editingKey ? { ...novoItem, _key: editingKey, persistido: i.persistido } : i));
      setEditingKey(null);
    } else {
      setItens(prev => [...prev, { ...novoItem, _key: nextKey(), persistido: false }]);
    }
    setNovoItem(itemVazio(nextKey));
  };

  const mudarNovoItem = (changes: Partial<ItemLocal>) => { setNovoItem(prev => ({ ...prev, ...changes })); setErroItem(''); };

  const editarItem = (item: ItemLocal) => { setNovoItem(item); setEditingKey(item._key); setErroItem(''); };

  const removerItem = (key: number) => {
    setItens(prev => prev.filter(i => i._key !== key));
    if (editingKey === key) { setEditingKey(null); setNovoItem(itemVazio(nextKey)); }
  };

  const trocarClassificacaoDoItem = (key: number, id: number | '') =>
    setItens(prev => prev.map(i => i._key === key ? { ...i, classificacaoContaId: id } : i));

  // ------------------------------------------------------------------ totais (prévia; o servidor recalcula ao salvar)

  const frete = Number(form.valorFrete) || 0;
  const seguro = Number(form.valorSeguro) || 0;
  const outras = Number(form.outrasDespesas) || 0;
  const custoAdicional = frete + seguro + outras;
  const calculados = itens.map(i => ({ item: i, ...calcularItem(i) }));
  const totalBruto = calculados.reduce((s, c) => s + c.bruto, 0);
  const totalDesconto = calculados.reduce((s, c) => s + c.descontoValor, 0);
  const totalLiquido = totalBruto - totalDesconto;
  const totalNota = totalLiquido + custoAdicional;
  const totalQuantidade = calculados.reduce((s, c) => s + (Number(c.item.quantidade) || 0), 0);
  const rateioDoItem = (liquido: number) =>
    totalLiquido > 0 ? custoAdicional * (liquido / totalLiquido) : (itens.length > 0 ? custoAdicional / itens.length : 0);
  const custoFinalDoItem = (c: { item: ItemLocal; liquido: number }) => {
    const q = Number(c.item.quantidade) || 0;
    return q > 0 ? (c.liquido + rateioDoItem(c.liquido)) / q : 0;
  };

  // ------------------------------------------------------------------ validações de data/placa (ao vivo)

  const erroEmissao = form.dataEmissao && form.dataEmissao > hoje ? 'Data de emissão não pode ser posterior à data atual.' : '';
  const erroChegada = form.dataChegada
    ? (form.dataEmissao && form.dataChegada < form.dataEmissao ? 'Data de chegada não pode ser anterior à data de emissão.'
      : form.dataChegada > hoje ? 'Data de chegada não pode ser posterior à data atual.' : '')
    : '';
  const erroPlaca = form.placaVeiculo && !PLACA.test(form.placaVeiculo) ? 'Placa inválida (use ABC-1234 ou ABC1D23).' : '';

  // ------------------------------------------------------------------ salvar

  const montarRequisicao = (): NotaEntradaRequest | null => {
    if (!chaveValidada) { mostrarErro('Valide a chave da nota (Modelo, Série, Número e Fornecedor) antes de salvar.'); return null; }
    if (!form.dataEmissao) { mostrarErro('Data de emissão é obrigatória.'); return null; }
    if (erroEmissao) { mostrarErro(erroEmissao); return null; }
    if (erroChegada) { mostrarErro(erroChegada); return null; }
    if (erroPlaca) { mostrarErro(erroPlaca); return null; }
    for (const [idx, i] of itens.entries()) {
      if (!i.classificacaoContaId) {
        mostrarErro(`Selecione a classificação da conta do item ${idx + 1} (${produtoDe(i.produtoId)?.nome ?? 'produto'}).`);
        return null;
      }
    }
    return {
      modelo: Number(chave.modelo), serie: Number(chave.serie), numero: Number(chave.numero),
      fornecedorId: Number(fornecedorIdInput),
      dataEmissao: form.dataEmissao,
      dataChegada: form.dataChegada || undefined,
      tipoFrete: form.tipoFrete || undefined,
      valorFrete: frete, valorSeguro: seguro, outrasDespesas: outras,
      condicaoPagamentoId: form.condicaoPagamentoId || null,
      transportadoraId: form.transportadoraId || null,
      placaVeiculo: form.placaVeiculo.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
      pedidoNumero: pedido?.numero ?? null, pedidoSerie: pedido?.serie ?? null, pedidoModelo: pedido?.modelo ?? null,
      itens: itens.map(i => ({
        produtoId: Number(i.produtoId),
        classificacaoContaId: Number(i.classificacaoContaId),
        quantidade: Number(i.quantidade),
        valorUnitario: Number(i.valorUnitario),
        descontoPercentual: Number(calcularItem(i).descontoPercentual.toFixed(2)),
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
  const classifTravadaNoPainel = classificacaoTravada(novoItem.produtoId, editingKey);
  const chaveBloqueada = chaveValidada || somenteLeitura;

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

        {/* Chave */}
        <SectionHeader label="Identificação da Nota (chave)" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Modelo *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="Ex: 55" value={chave.modelo}
              onChange={e => { setChave({ ...chave, modelo: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Série *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="Ex: 1" value={chave.serie}
              onChange={e => { setChave({ ...chave, serie: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Número *</label>
            <input type="number" min={1} step={1} style={inputStyle} placeholder="Ex: 12345" value={chave.numero}
              onChange={e => { setChave({ ...chave, numero: e.target.value }); setErroChave(''); }} disabled={chaveBloqueada} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>ID Fornecedor *</label>
            <input type="number" min={1} step={1} style={inputStyle} value={fornecedorIdInput}
              onChange={e => { setFornecedorIdInput(e.target.value); setErroChave(''); }}
              disabled={chaveBloqueada || pedido != null} />
          </div>
          <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {!chaveValidada && (
              <button type="button" onClick={validarChave} disabled={validando} style={{ ...btnPrimary, padding: '10px 20px', opacity: validando ? 0.6 : 1 }}>
                {validando ? 'Validando...' : '🔍 Validar chave'}
              </button>
            )}
          </div>
        </div>
        {erroChave && <p style={{ ...erroBanner, marginTop: -8 }}>{erroChave}</p>}

        {chaveValidada && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#2D6A4F', fontWeight: 600, fontSize: 14 }}>
              ✓ Nota {chave.numero}/{chave.serie} (modelo {chave.modelo}) — Fornecedor: {fornecedorNome || `#${fornecedorIdInput}`}
            </span>
            {!somenteLeitura && isNovo && (
              <button type="button" onClick={trocarChave} disabled={!podeTrocarChave}
                title={podeTrocarChave ? '' : 'Remova os produtos da nota para poder trocar a chave'}
                style={{ ...btnCancel, padding: '6px 14px', fontSize: 12, opacity: podeTrocarChave ? 1 : 0.5, cursor: podeTrocarChave ? 'pointer' : 'not-allowed' }}>
                Trocar chave
              </button>
            )}
          </div>
        )}
        {!chaveValidada && !somenteLeitura && (
          <p style={{ color: '#8B6E63', fontSize: 13, fontStyle: 'italic', marginTop: -8 }}>
            Informe Modelo, Série, Número e Fornecedor e valide a chave para liberar o restante do formulário.
            Depois que a nota tiver produtos, a chave não pode mais ser alterada.
          </p>
        )}

        {/* Pedido de compra */}
        {!somenteLeitura && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setBuscandoPedido(true)} style={{ ...btnCancel, padding: '8px 18px' }}>
              Buscar Pedido de Compra
            </button>
            {pedido && (
              <>
                <span style={{ fontSize: 13, color: '#3D2B1F' }}>
                  Vinculada ao Pedido de Compra <strong>{pedido.modelo}/{pedido.serie}/{pedido.numero}</strong>
                </span>
                <button type="button" onClick={() => setPedido(null)} style={{ background: 'none', border: 'none', color: '#C97B6B', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                  remover vínculo
                </button>
              </>
            )}
          </div>
        )}
        {somenteLeitura && pedido && (
          <p style={{ fontSize: 13, color: '#3D2B1F' }}>Vinculada ao Pedido de Compra <strong>{pedido.modelo}/{pedido.serie}/{pedido.numero}</strong></p>
        )}

        {/* Dados da nota */}
        <SectionHeader label="Dados da Nota" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data de Emissão *</label>
            <input type="date" max={hoje} style={inputStyle} value={form.dataEmissao}
              onChange={e => setCampo({ dataEmissao: e.target.value })} disabled={!formLiberado} />
            {erroEmissao && <p style={dicaErro}>{erroEmissao}</p>}
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Data de Chegada</label>
            <input type="date" min={form.dataEmissao || undefined} max={hoje} style={inputStyle} value={form.dataChegada}
              onChange={e => setCampo({ dataChegada: e.target.value })} disabled={!formLiberado} />
            {erroChegada
              ? <p style={dicaErro}>{erroChegada}</p>
              : <p style={dica}>Se ficar vazia, é preenchida com a data da confirmação.</p>}
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Tipo de Frete</label>
            <select style={sel} value={form.tipoFrete} onChange={e => setCampo({ tipoFrete: e.target.value as '' | 'CIF' | 'FOB' })} disabled={!formLiberado}>
              <option value="">Selecione</option>
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 4' }}>
            <label style={labelStyle}>Condição de Pagamento</label>
            <select style={sel} value={form.condicaoPagamentoId}
              onChange={e => setCampo({ condicaoPagamentoId: e.target.value ? Number(e.target.value) : '' })} disabled={!formLiberado}>
              <option value="">Selecione</option>
              {condicoes.filter(c => c.ativo !== false || c.id === form.condicaoPagamentoId)
                .map(c => <option key={c.id} value={c.id}>{c.condicao}</option>)}
            </select>
            {condicaoDoFornecedor != null && form.condicaoPagamentoId === condicaoDoFornecedor && (
              <p style={dica}>Preenchida a partir do fornecedor. Pode ser alterada.</p>
            )}
          </div>
          <div style={{ gridColumn: 'span 6' }}>
            <label style={labelStyle}>Transportadora</label>
            <select style={sel} value={form.transportadoraId}
              onChange={e => setCampo({ transportadoraId: e.target.value ? Number(e.target.value) : '' })} disabled={!formLiberado}>
              <option value="">Selecione</option>
              {transportadoras.filter(t => t.ativo !== false || t.id === form.transportadoraId)
                .map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 3' }}>
            <label style={labelStyle}>Placa do Veículo</label>
            <input style={inputStyle} placeholder="ABC-1234 ou ABC1D23" maxLength={8} value={form.placaVeiculo}
              onChange={e => setCampo({ placaVeiculo: e.target.value.toUpperCase() })} disabled={!formLiberado} />
            {erroPlaca && <p style={dicaErro}>{erroPlaca}</p>}
          </div>
        </div>

        {/* Adicionar produto */}
        {!somenteLeitura && (<>
          <SectionHeader label="Adicionar Produto" />
          <div style={g12}>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Produto *</label>
              <select style={sel} value={novoItem.produtoId}
                onChange={e => onSelecionarProduto(e.target.value ? Number(e.target.value) : '')} disabled={!formLiberado}>
                <option value="">Selecione</option>
                {produtos.filter(p => p.ativo !== false).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <label style={labelStyle}>Classificação da Conta *</label>
              <select style={sel} value={novoItem.classificacaoContaId}
                onChange={e => mudarNovoItem({ classificacaoContaId: e.target.value ? Number(e.target.value) : '' })}
                disabled={!formLiberado || classifTravadaNoPainel}>
                <option value="">Selecione</option>
                {classificacoes.filter(c => c.ativo !== false || c.id === novoItem.classificacaoContaId)
                  .map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {classifTravadaNoPainel && <p style={dica}>Item já salvo: a classificação não pode ser alterada.</p>}
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={labelStyle}>UND</label>
              <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }}
                value={produtoDe(novoItem.produtoId)?.unidadeMedida?.sigla || '—'} disabled />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <label style={labelStyle}>Qtd. *</label>
              <input type="number" min={0.001} step={0.001} style={inputStyle} value={novoItem.quantidade}
                onChange={e => mudarNovoItem({ quantidade: e.target.value })} disabled={!formLiberado} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Valor Unitário (R$) *</label>
              <input type="number" min={0} step={0.01} style={inputStyle} value={novoItem.valorUnitario}
                onChange={e => mudarNovoItem({ valorUnitario: e.target.value })} disabled={!formLiberado} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Desconto</label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input type="number" min={0} step={0.01} style={inputStyle} value={novoItem.descontoInput}
                  onChange={e => mudarNovoItem({ descontoInput: e.target.value })} disabled={!formLiberado} />
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E8D5CC' }}>
                  {(['PERCENTUAL', 'VALOR'] as const).map(modo => (
                    <button key={modo} type="button" disabled={!formLiberado}
                      onClick={() => mudarNovoItem({ descontoModo: modo })}
                      style={{
                        padding: '10px 10px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                        backgroundColor: novoItem.descontoModo === modo ? '#C97B6B' : 'white',
                        color: novoItem.descontoModo === modo ? 'white' : '#8B6E63',
                      }}>{modo === 'PERCENTUAL' ? '%' : 'R$'}</button>
                  ))}
                </div>
              </div>
              {(() => { const c = calcularItem(novoItem); return (
                <p style={dica}>Percentual: {c.descontoPercentual.toFixed(2)}% &nbsp;|&nbsp; Valor: {fmt(c.descontoValor)}</p>
              ); })()}
            </div>
          </div>
          {erroItem && <p style={{ ...erroBanner, marginTop: 0 }}>{erroItem}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Lato, sans-serif', fontSize: 13, color: '#8B6E63' }}>
              Total do item: <strong style={{ color: '#C97B6B' }}>{fmt(calcularItem(novoItem).liquido)}</strong>
            </span>
            {formLiberado && (
              <button type="button" onClick={adicionarOuAtualizarItem}
                style={{ backgroundColor: 'transparent', border: '1px dashed #C97B6B', color: '#C97B6B', borderRadius: 6, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {editingKey != null ? '✓ Atualizar Produto' : '+ Adicionar Produto'}
              </button>
            )}
          </div>
        </>)}

        {/* Lista de produtos */}
        <SectionHeader label="Produtos da Nota" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#FDF0E8' }}>
                {['Produto', 'Classificação', 'UND', 'Qtd.', 'Valor Unit.', 'Desc. %', 'Desc. R$', 'Rateio (R$)', 'Custo Final (unit.)', 'Total'].map(h => (
                  <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>
                ))}
                {formLiberado && <th style={{ ...th, padding: '8px 12px', width: 70 }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {calculados.map(c => {
                const { item } = c;
                const produto = produtoDe(item.produtoId);
                const rateio = rateioDoItem(c.liquido);
                return (
                  <tr key={item._key} style={{ borderTop: '1px solid #F0E6DC' }}>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{produto?.nome || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>
                      {formLiberado && !item.persistido ? (
                        <select style={{ ...sel, fontSize: 12, padding: '5px 8px' }} value={item.classificacaoContaId}
                          onChange={e => trocarClassificacaoDoItem(item._key, e.target.value ? Number(e.target.value) : '')}>
                          <option value="">Selecione</option>
                          {classificacoes.filter(x => x.ativo !== false).map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                        </select>
                      ) : (classificacoes.find(x => x.id === item.classificacaoContaId)?.nome || '—')}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{produto?.unidadeMedida?.sigla || '—'}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{item.quantidade}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{fmt(Number(item.valorUnitario))}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{c.descontoPercentual.toFixed(2)}%</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{fmt(c.descontoValor)}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{fmt(rateio)}</td>
                    <td style={{ padding: '8px 10px', fontSize: 13 }}>{fmt(custoFinalDoItem(c))}</td>
                    <td style={{ padding: '8px 10px', fontSize: 14, fontWeight: 600, color: '#C97B6B' }}>{fmt(c.liquido)}</td>
                    {formLiberado && (
                      <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button type="button" onClick={() => editarItem(item)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 6 }}>✏️</button>
                        <button type="button" onClick={() => removerItem(item._key)} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C97B6B' }}>🗑️</button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {itens.length === 0 && (
                <tr><td colSpan={formLiberado ? 11 : 10} style={{ padding: 24, textAlign: 'center', color: '#8B6E63', fontSize: 13 }}>Nenhum produto adicionado</td></tr>
              )}
            </tbody>
            {itens.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid #E8D5CC', backgroundColor: '#FDF0E8' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13 }} colSpan={3}>Totais</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13 }}>{totalQuantidade}</td>
                  <td colSpan={2} />
                  <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13 }}>{fmt(totalDesconto)}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 13 }}>{fmt(custoAdicional)}</td>
                  <td />
                  <td style={{ padding: '8px 10px', fontWeight: 700, fontSize: 14, color: '#C97B6B' }}>{fmt(totalLiquido)}</td>
                  {formLiberado && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {itens.length === 0 && formLiberado && (
          <p style={{ ...dica, marginBottom: 12 }}>A nota pode ser salva sem produtos, mas só pode ser confirmada quando tiver pelo menos um.</p>
        )}
        {formLiberado && itens.length > 0 && (
          <p style={{ ...dica, marginBottom: 12 }}>Rateio e custo final mostrados aqui são uma prévia; ao salvar, o sistema recalcula tudo.</p>
        )}

        {/* Custos e totais */}
        <SectionHeader label="Custos e Totais" />
        <div style={g12}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Frete (R$)</label>
            <input type="number" min={0} step={0.01} style={inputStyle} value={form.valorFrete}
              onChange={e => setCampo({ valorFrete: e.target.value })} disabled={!formLiberado} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Seguro (R$)</label>
            <input type="number" min={0} step={0.01} style={inputStyle} value={form.valorSeguro}
              onChange={e => setCampo({ valorSeguro: e.target.value })} disabled={!formLiberado} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Outras Despesas (R$)</label>
            <input type="number" min={0} step={0.01} style={inputStyle} value={form.outrasDespesas}
              onChange={e => setCampo({ outrasDespesas: e.target.value })} disabled={!formLiberado} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Total dos Produtos</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }} value={fmt(totalBruto)} disabled />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Desconto</label>
            <input style={{ ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' }} value={fmt(totalDesconto)} disabled />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ backgroundColor: '#FDF0E8', padding: '10px 16px', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: '#8B6E63', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Total da Nota</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#C97B6B', fontWeight: 700 }}>{fmt(totalNota)}</span>
            </div>
          </div>
        </div>

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
          fornecedorId={chaveValidada ? Number(fornecedorIdInput) : null}
          onSelecionar={aoSelecionarPedido}
          onClose={() => setBuscandoPedido(false)}
        />
      )}
    </div>
  );
}
