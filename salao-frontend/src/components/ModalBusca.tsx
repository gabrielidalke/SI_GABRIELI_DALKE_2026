import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { mensagemDeErro } from '../services/notaEntradaService';
import { th, td, inputStyle, modalOverlay, modalBox, btnCancel, btnPrimary, erroBanner } from '../styles/theme';

export interface ColunaBusca<T> {
  titulo: string;
  render: (item: T) => ReactNode;
}

interface Props<T> {
  titulo: string;
  descricao?: string;
  carregar: () => Promise<T[]>; // precisa ser estável (função fora do componente)
  colunas: ColunaBusca<T>[];
  chave: (item: T) => string | number;
  texto: (item: T) => string; // o que a caixa "Pesquisar" procura
  vazio?: string;
  onSelecionar: (item: T) => void;
  onClose: () => void;
}

// Popup de busca no mesmo estilo do "Buscar Pedido de Compra": tabela com botão Selecionar em cada linha
export default function ModalBusca<T>({ titulo, descricao, carregar, colunas, chave, texto, vazio, onSelecionar, onClose }: Props<T>) {
  const [itens, setItens] = useState<T[] | null>(null);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregar()
      .then(setItens)
      .catch(e => { setErro(mensagemDeErro(e, 'Erro ao carregar a lista.')); setItens([]); });
  }, [carregar]);

  const visiveis = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    return (itens ?? []).filter(i => !f || texto(i).toLowerCase().includes(f));
  }, [itens, filtro, texto]);

  return (
    <div style={modalOverlay}>
      <div style={{ ...modalBox, maxWidth: 820, maxHeight: '85vh', overflowY: 'auto' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: '0 0 6px' }}>{titulo}</h3>
        {descricao && <p style={{ fontSize: 13, color: '#8B6E63', marginTop: 0, marginBottom: 16 }}>{descricao}</p>}

        <input style={{ ...inputStyle, marginBottom: 16 }} placeholder="Pesquisar..." autoFocus
          value={filtro} onChange={e => setFiltro(e.target.value)} />

        {erro && <p style={erroBanner}>{erro}</p>}

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ backgroundColor: '#FDF0E8' }}>
              {[...colunas.map(c => c.titulo), ''].map((h, i) => <th key={i} style={{ ...th, padding: '8px 12px' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {visiveis.map(item => (
              <tr key={chave(item)} style={{ borderTop: '1px solid #F0E6DC' }}>
                {colunas.map((c, i) => <td key={i} style={{ ...td, padding: '10px 12px', fontSize: 13 }}>{c.render(item)}</td>)}
                <td style={{ ...td, padding: '10px 12px' }}>
                  <button type="button" style={{ ...btnPrimary, padding: '6px 16px', fontSize: 12 }} onClick={() => onSelecionar(item)}>
                    Selecionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {itens === null && <p style={{ textAlign: 'center', color: '#8B6E63', padding: 24 }}>Carregando...</p>}
        {itens !== null && visiveis.length === 0 && !erro && (
          <p style={{ textAlign: 'center', color: '#8B6E63', padding: 24 }}>{filtro ? 'Nada encontrado para esta pesquisa.' : (vazio ?? 'Nenhum registro encontrado.')}</p>
        )}

        <button type="button" onClick={onClose} style={btnCancel}>Fechar</button>
      </div>
    </div>
  );
}
