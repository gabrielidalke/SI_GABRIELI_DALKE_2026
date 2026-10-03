import type { CSSProperties, ReactNode } from 'react';
import type { Produto } from '../services/produtoService';
import type { ClassificacaoConta } from '../services/classificacaoContaService';
import { calcularItem, fmt, somar, totalGeral, type Despesas, type ItemCalculado, type ItemLocal } from '../utils/itensCompra';
import { inputStyle, labelStyle, th, erroBanner } from '../styles/theme';

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const somenteExibicao: CSSProperties = { ...inputStyle, backgroundColor: '#F5F0ED', color: '#8B6E63' };
const dica: CSSProperties = { fontSize: 11, color: '#8B6E63', marginTop: 4, marginBottom: 0 };
const g12: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 16, marginBottom: 12 };

// Texto do campo de desconto que NÃO foi o último digitado (mostra o valor calculado)
const calculado = (n: number, input: string) => (input === '' ? '' : String(n));

interface PainelProps {
  item: ItemLocal;
  produtos: Produto[];
  classificacoes: ClassificacaoConta[];
  classificacaoTravada: boolean;
  desabilitado: boolean;
  editando: boolean;
  erro: string;
  onProduto: (produtoId: number | '') => void;
  onMudar: (changes: Partial<ItemLocal>) => void;
  onAdicionar: () => void;
  onCancelarEdicao: () => void;
}

// Painel "Adicionar Produto" — o mesmo no Pedido de Compra e na Nota de Entrada
export function PainelProduto({
  item, produtos, classificacoes, classificacaoTravada, desabilitado, editando, erro,
  onProduto, onMudar, onAdicionar, onCancelarEdicao,
}: PainelProps) {
  const c = calcularItem(item);
  const produto = produtos.find(p => p.id === item.produtoId);
  const emPercentual = item.descontoModo === 'PERCENTUAL';

  return (
    <>
      <div style={g12}>
        <div style={{ gridColumn: 'span 4' }}>
          <label style={labelStyle}>Produto *</label>
          <select style={sel} value={item.produtoId} disabled={desabilitado}
            onChange={e => onProduto(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Selecione</option>
            {produtos.filter(p => p.ativo !== false || p.id === item.produtoId)
              .map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <label style={labelStyle}>Classificação da Conta *</label>
          <select style={sel} value={item.classificacaoContaId} disabled={desabilitado || classificacaoTravada}
            onChange={e => onMudar({ classificacaoContaId: e.target.value ? Number(e.target.value) : '' })}>
            <option value="">Selecione</option>
            {classificacoes.filter(x => x.ativo !== false || x.id === item.classificacaoContaId)
              .map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
          </select>
          {classificacaoTravada && <p style={dica}>Item já salvo: a classificação não pode ser alterada.</p>}
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <label style={labelStyle}>UND</label>
          <input style={somenteExibicao} value={produto?.unidadeMedida?.sigla || '—'} disabled />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Qtd. *</label>
          <input type="number" min={0.001} step={0.001} style={inputStyle} value={item.quantidade} disabled={desabilitado}
            onChange={e => onMudar({ quantidade: e.target.value })} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Valor Unit. (R$) *</label>
          <input type="number" min={0} step={0.01} style={inputStyle} value={item.valorUnitario} disabled={desabilitado}
            onChange={e => onMudar({ valorUnitario: e.target.value })} />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Desconto (%)</label>
          <input type="number" min={0} max={100} step={0.01} style={inputStyle} disabled={desabilitado}
            value={emPercentual ? item.descontoInput : calculado(c.descontoPercentual, item.descontoInput)}
            onChange={e => onMudar({ descontoModo: 'PERCENTUAL', descontoInput: e.target.value })} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Desconto (R$)</label>
          <input type="number" min={0} step={0.01} style={inputStyle} disabled={desabilitado}
            value={emPercentual ? calculado(c.descontoValor, item.descontoInput) : item.descontoInput}
            onChange={e => onMudar({ descontoModo: 'VALOR', descontoInput: e.target.value })} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Valor Bruto</label>
          <input style={somenteExibicao} value={fmt(c.bruto)} disabled />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Valor c/ Desconto</label>
          <input style={{ ...somenteExibicao, color: '#C97B6B', fontWeight: 700 }} value={fmt(c.liquido)} disabled />
        </div>
        <div style={{ gridColumn: 'span 4', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onAdicionar} disabled={desabilitado}
            style={{ backgroundColor: 'transparent', border: '1px dashed #C97B6B', color: '#C97B6B', borderRadius: 6, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, flex: 1 }}>
            {editando ? '✓ Atualizar Produto' : '+ Adicionar Produto'}
          </button>
          {editando && (
            <button type="button" onClick={onCancelarEdicao}
              style={{ background: 'none', border: '1px solid #E8D5CC', color: '#8B6E63', borderRadius: 6, padding: '10px 14px', cursor: 'pointer', fontSize: 13 }}>
              Cancelar
            </button>
          )}
        </div>
      </div>
      {erro && <p style={{ ...erroBanner, marginTop: 0 }}>{erro}</p>}
    </>
  );
}

interface TotaisProps {
  itens: ItemLocal[];
  despesas: Despesas;
  desabilitado: boolean;
  rotuloTotal: string;
  onMudar: (changes: Partial<Despesas>) => void;
}

const caixaTotal: CSSProperties = { backgroundColor: '#FDF0E8', padding: '10px 16px', borderRadius: 10 };
const rotuloCaixa: CSSProperties = { fontSize: 11, color: '#8B6E63', fontWeight: 700, textTransform: 'uppercase', display: 'block' };

// Rodapé com os totais: Produtos Bruto, Desconto dos itens, Produtos Líquido, Frete, Seguro, Outras e o Total
export function BlocoTotais({ itens, despesas, desabilitado, rotuloTotal, onMudar }: TotaisProps) {
  const t = somar(itens.map(calcularItem));
  const campo = (rotulo: string, chave: keyof Despesas) => (
    <div style={{ gridColumn: 'span 2' }}>
      <label style={labelStyle}>{rotulo}</label>
      <input type="number" min={0} step={0.01} style={inputStyle} value={despesas[chave]} disabled={desabilitado}
        placeholder="0,00" onChange={e => onMudar({ [chave]: e.target.value })} />
    </div>
  );
  const leitura = (rotulo: string, valor: number) => (
    <div style={{ gridColumn: 'span 2' }}>
      <label style={labelStyle}>{rotulo}</label>
      <input style={somenteExibicao} value={fmt(valor)} disabled />
    </div>
  );

  return (
    <div style={{ ...g12, marginBottom: 24 }}>
      {leitura('Produtos Bruto', t.bruto)}
      {leitura('Total Desconto (itens)', t.desconto)}
      {leitura('Produtos Líquido', t.liquido)}
      {campo('Frete (R$)', 'valorFrete')}
      {campo('Seguro (R$)', 'valorSeguro')}
      {campo('Outras Despesas (R$)', 'outrasDespesas')}
      <div style={{ gridColumn: '9 / span 4' }}>
        <div style={caixaTotal}>
          <span style={rotuloCaixa}>{rotuloTotal}</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#C97B6B', fontWeight: 700 }}>
            {fmt(totalGeral(itens, despesas))}
          </span>
        </div>
      </div>
    </div>
  );
}

export interface ColunaExtra {
  titulo: string;
  render: (c: ItemCalculado) => ReactNode;
  total?: ReactNode;
}

interface TabelaProps {
  itens: ItemLocal[];
  produtos: Produto[];
  classificacoes: ClassificacaoConta[];
  editavel: boolean; // lápis de editar e troca da classificação das linhas novas
  removivel?: boolean; // lixeira (padrão: igual a editavel)
  extras?: ColunaExtra[];
  vazio: string;
  onEditar: (item: ItemLocal) => void;
  onRemover: (key: number) => void;
  onTrocarClassificacao: (key: number, id: number | '') => void;
}

const celula: CSSProperties = { padding: '8px 10px', fontSize: 13 };

// Lista de produtos com totalizador no rodapé — a mesma no Pedido de Compra e na Nota de Entrada
export function TabelaItens({
  itens, produtos, classificacoes, editavel, removivel = editavel, extras = [], vazio, onEditar, onRemover, onTrocarClassificacao,
}: TabelaProps) {
  const calculados = itens.map(calcularItem);
  const total = somar(calculados);
  const comAcoes = editavel || removivel;
  const colunas = 9 + extras.length + (comAcoes ? 1 : 0);
  const cabecalho = ['Produto', 'Classificação', 'UND', 'Qtd.', 'Valor Unit.', 'Desc. %', 'Desc. R$', 'Valor Bruto', 'Valor c/ Desc.', ...extras.map(e => e.titulo)];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr style={{ backgroundColor: '#FDF0E8' }}>
            {cabecalho.map(h => <th key={h} style={{ ...th, padding: '8px 12px' }}>{h}</th>)}
            {comAcoes && <th style={{ ...th, padding: '8px 12px', width: 70 }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {calculados.map(c => {
            const { item } = c;
            const produto = produtos.find(p => p.id === item.produtoId);
            return (
              <tr key={item._key} style={{ borderTop: '1px solid #F0E6DC' }}>
                <td style={celula}>{produto?.nome || '—'}</td>
                <td style={celula}>
                  {editavel && !item.persistido ? (
                    <select style={{ ...sel, fontSize: 12, padding: '5px 8px' }} value={item.classificacaoContaId}
                      onChange={e => onTrocarClassificacao(item._key, e.target.value ? Number(e.target.value) : '')}>
                      <option value="">Selecione</option>
                      {classificacoes.filter(x => x.ativo !== false || x.id === item.classificacaoContaId)
                        .map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
                    </select>
                  ) : (classificacoes.find(x => x.id === item.classificacaoContaId)?.nome || '—')}
                </td>
                <td style={celula}>{produto?.unidadeMedida?.sigla || '—'}</td>
                <td style={celula}>{item.quantidade}</td>
                <td style={celula}>{fmt(Number(item.valorUnitario))}</td>
                <td style={celula}>{c.descontoPercentual.toFixed(2)}%</td>
                <td style={celula}>{fmt(c.descontoValor)}</td>
                <td style={celula}>{fmt(c.bruto)}</td>
                <td style={{ ...celula, fontSize: 14, fontWeight: 600, color: '#C97B6B' }}>{fmt(c.liquido)}</td>
                {extras.map(e => <td key={e.titulo} style={celula}>{e.render(c)}</td>)}
                {comAcoes && (
                  <td style={{ ...celula, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {editavel && (
                      <button type="button" onClick={() => onEditar(item)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 6 }}>✏️</button>
                    )}
                    {removivel && (
                      <button type="button" onClick={() => onRemover(item._key)} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C97B6B' }}>🗑️</button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {itens.length === 0 && (
            <tr><td colSpan={colunas} style={{ padding: 24, textAlign: 'center', color: '#8B6E63', fontSize: 13 }}>{vazio}</td></tr>
          )}
        </tbody>
        {itens.length > 0 && (
          <tfoot>
            <tr style={{ borderTop: '2px solid #E8D5CC', backgroundColor: '#FDF0E8' }}>
              <td style={{ ...celula, fontWeight: 700 }} colSpan={3}>Totais</td>
              <td style={{ ...celula, fontWeight: 700 }}>{total.quantidade}</td>
              <td colSpan={2} />
              <td style={{ ...celula, fontWeight: 700 }}>{fmt(total.desconto)}</td>
              <td style={{ ...celula, fontWeight: 700 }}>{fmt(total.bruto)}</td>
              <td style={{ ...celula, fontWeight: 700, fontSize: 14, color: '#C97B6B' }}>{fmt(total.liquido)}</td>
              {extras.map(e => <td key={e.titulo} style={{ ...celula, fontWeight: 700 }}>{e.total}</td>)}
              {comAcoes && <td />}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
