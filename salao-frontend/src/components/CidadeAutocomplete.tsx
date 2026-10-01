import { useEffect, useMemo, useRef, useState } from 'react';
import { cidadeService } from '../services/cidadeService';
import type { Cidade } from '../services/cidadeService';
import { inputStyle } from '../styles/theme';

// Refetched on every mount so cities created/edited since page load show up; concurrent mounts share one request
let _loading: Promise<Cidade[]> | null = null;

function getCidades(): Promise<Cidade[]> {
  if (!_loading) {
    _loading = cidadeService.listar()
      .then(r => r.data)
      .finally(() => { _loading = null; });
  }
  return _loading;
}

function labelFor(c: Cidade) {
  return c.estadoUf ? `${c.nome} - ${c.estadoUf}` : c.nome;
}

// Campo vazio: navega a lista inteira (ordenada, até 30). Com texto: busca por nome/UF (até 10).
function filtrar(todas: Cidade[], query: string): Cidade[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...todas].sort((a, b) => labelFor(a).localeCompare(labelFor(b), 'pt-BR')).slice(0, 30);
  }
  return todas
    .filter(c => c.nome.toLowerCase().includes(q) || (c.estadoUf && c.estadoUf.toLowerCase().startsWith(q)))
    .slice(0, 10);
}

interface Props {
  value: number | null;
  onChange: (cidadeId: number | null) => void;
  placeholder?: string;
}

export default function CidadeAutocomplete({ value, onChange, placeholder = 'Clique para ver ou digite para buscar...' }: Props) {
  const [texto, setTexto] = useState('');
  const [aberto, setAberto] = useState(false);
  const [todas, setTodas] = useState<Cidade[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Track the id whose label is currently showing, to avoid resetting text while user types
  const valorAtualRef = useRef<number | null>(null);

  // Load all cities once
  useEffect(() => {
    getCidades().then(data => setTodas(data));
  }, []);

  // Sync display text when value or cidade list changes
  useEffect(() => {
    if (value && value !== valorAtualRef.current && todas.length > 0) {
      const c = todas.find(x => x.id === value);
      if (c) {
        valorAtualRef.current = value;
        setTexto(labelFor(c));
      }
    }
    if (!value && valorAtualRef.current !== null) {
      valorAtualRef.current = null;
      setTexto('');
    }
  }, [value, todas]);

  // Close on outside click and revert text
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
        // Revert text to selected city or clear
        if (value && todas.length > 0) {
          const c = todas.find(x => x.id === value);
          setTexto(c ? labelFor(c) : '');
        } else {
          setTexto('');
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [value, todas]);

  // Deriva das sugestões de "todas" a cada render: se a lista ainda estava carregando no
  // momento do clique, o menu se preenche sozinho assim que ela chegar (sem precisar focar de novo)
  const sugestoes = useMemo(
    () => (aberto ? filtrar(todas, value ? '' : texto) : []),
    [aberto, todas, value, texto]
  );

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTexto(v);
    valorAtualRef.current = null;
    onChange(null); // clear selection while typing
    setAberto(true);
  };

  const selecionar = (c: Cidade) => {
    valorAtualRef.current = c.id;
    onChange(c.id);
    setTexto(labelFor(c));
    setAberto(false);
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Campo já preenchido (cidade selecionada): seleciona o texto para digitar por cima em vez de filtrar por ele
    if (value && texto) e.target.select();
    setAberto(true);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        style={inputStyle}
        value={texto}
        onChange={onInput}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete="off"
      />

      {aberto && sugestoes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 2px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #E8D5CC',
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          maxHeight: 200,
          overflowY: 'auto',
          zIndex: 2000,
        }}>
          {sugestoes.map(c => (
            <DropdownItem key={c.id} label={labelFor(c)} onSelect={() => selecionar(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseDown={e => { e.preventDefault(); onSelect(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        color: '#3D2B1F',
        fontSize: 14,
        fontFamily: 'Lato, sans-serif',
        backgroundColor: hover ? '#FDF0E8' : 'white',
        transition: 'background-color 0.1s',
      }}
    >
      {label}
    </div>
  );
}
