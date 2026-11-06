import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { cidadeService, type Cidade } from '../services/cidadeService';
import { estadoService, type Estado } from '../services/estadoService';
import { paisService, type Pais } from '../services/paisService';
import { mensagemDeErro } from '../services/notaEntradaService';
import ModalCadastro from './ModalCadastro';
import { inputStyle, labelStyle, erroBanner, btnPrimary, btnCancel } from '../styles/theme';

interface Props {
  aberto: boolean;
  nomeInicial?: string;
  onFechar: () => void;
  onSalva: (cidade: Cidade) => void;
}

const sel: CSSProperties = { ...inputStyle, cursor: 'pointer' };
const linkNovo: CSSProperties = { background: 'none', border: 'none', color: '#C97B6B', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 };
const caixa: CSSProperties = { border: '1px dashed #E8D5CC', borderRadius: 10, padding: 14, marginTop: 10, backgroundColor: 'white' };

// Cadastro rápido de cidade (com estado e país, se ainda não existirem) sem sair do formulário atual
export default function NovaCidadeModal({ aberto, nomeInicial = '', onFechar, onSalva }: Props) {
  const [nome, setNome] = useState(nomeInicial);
  const [ddd, setDdd] = useState('');
  const [estadoId, setEstadoId] = useState<number | ''>('');
  const [estados, setEstados] = useState<Estado[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [novoEstado, setNovoEstado] = useState<{ nome: string; uf: string; paisId: number | '' } | null>(null);
  const [novoPais, setNovoPais] = useState<{ nome: string; sigla: string; ddi: string } | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    estadoService.listar().then(r => setEstados(r.data)).catch(() => setEstados([]));
    paisService.listar().then(r => setPaises(r.data)).catch(() => setPaises([]));
  }, [aberto]);

  const salvarPais = async () => {
    if (!novoPais) return;
    if (!novoPais.nome.trim()) { setErro('Informe o nome do país.'); return; }
    if (novoPais.sigla.trim().length < 2) { setErro('Informe a sigla do país (2 ou 3 letras).'); return; }
    try {
      const r = await paisService.salvar({ nome: novoPais.nome.trim(), sigla: novoPais.sigla.trim(), ddi: novoPais.ddi.trim() || undefined, ativo: true });
      setPaises(prev => [...prev, r.data]);
      setNovoEstado(prev => (prev ? { ...prev, paisId: r.data.id } : prev));
      setNovoPais(null);
      setErro('');
    } catch (e) { setErro(mensagemDeErro(e, 'Erro ao salvar o país.')); }
  };

  const salvarEstado = async () => {
    if (!novoEstado) return;
    if (!novoEstado.nome.trim()) { setErro('Informe o nome do estado.'); return; }
    if (novoEstado.uf.trim().length !== 2) { setErro('Informe a UF do estado (2 letras).'); return; }
    if (!novoEstado.paisId) { setErro('Selecione o país do estado.'); return; }
    try {
      const r = await estadoService.salvar({ nome: novoEstado.nome.trim(), uf: novoEstado.uf.trim().toUpperCase(), paisId: novoEstado.paisId, ativo: true });
      setEstados(prev => [...prev, r.data]);
      setEstadoId(r.data.id);
      setNovoEstado(null);
      setErro('');
    } catch (e) { setErro(mensagemDeErro(e, 'Erro ao salvar o estado.')); }
  };

  const salvar = async () => {
    if (!nome.trim()) { setErro('Informe o nome da cidade.'); return; }
    if (!estadoId) { setErro('Selecione o estado da cidade.'); return; }
    if (ddd && !/^\d{2,3}$/.test(ddd)) { setErro('DDD inválido (2 ou 3 números).'); return; }
    setSalvando(true);
    try {
      const r = await cidadeService.salvar({ nome: nome.trim(), estadoId, ddd: ddd || undefined, ativo: true });
      onSalva(r.data);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Erro ao salvar a cidade.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ModalCadastro aberto={aberto} largura={560} onFechar={onFechar}>
      <div style={{ padding: 28 }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#3D2B1F', margin: '0 0 16px' }}>Nova Cidade</h3>
        {erro && <p style={erroBanner}>{erro}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 14 }}>
          <div>
            <label style={labelStyle}>Cidade *</label>
            <input style={inputStyle} autoFocus placeholder="Nome da cidade" value={nome} onChange={e => { setNome(e.target.value); setErro(''); }} />
          </div>
          <div>
            <label style={labelStyle}>DDD</label>
            <input style={inputStyle} placeholder="45" maxLength={3} value={ddd} onChange={e => { setDdd(e.target.value.replace(/\D/g, '')); setErro(''); }} />
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label style={labelStyle}>Estado *</label>
            {!novoEstado && <button type="button" style={linkNovo} onClick={() => setNovoEstado({ nome: '', uf: '', paisId: '' })}>+ Novo estado</button>}
          </div>
          <select style={sel} value={estadoId} onChange={e => { setEstadoId(e.target.value ? Number(e.target.value) : ''); setErro(''); }}>
            <option value="">Selecione</option>
            {estados.filter(x => x.ativo !== false).map(x => <option key={x.id} value={x.id}>{x.nome} ({x.uf})</option>)}
          </select>
        </div>

        {novoEstado && (
          <div style={caixa}>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Novo estado</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px', gap: 10 }}>
              <input style={inputStyle} placeholder="Nome do estado" value={novoEstado.nome} onChange={e => setNovoEstado({ ...novoEstado, nome: e.target.value })} />
              <input style={inputStyle} placeholder="UF" maxLength={2} value={novoEstado.uf} onChange={e => setNovoEstado({ ...novoEstado, uf: e.target.value.toUpperCase() })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
              <span style={{ fontSize: 11, color: '#8B6E63', fontWeight: 700 }}>PAÍS *</span>
              {!novoPais && <button type="button" style={linkNovo} onClick={() => setNovoPais({ nome: '', sigla: '', ddi: '' })}>+ Novo país</button>}
            </div>
            <select style={sel} value={novoEstado.paisId} onChange={e => setNovoEstado({ ...novoEstado, paisId: e.target.value ? Number(e.target.value) : '' })}>
              <option value="">Selecione</option>
              {paises.filter(p => p.ativo !== false).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            {novoPais && (
              <div style={{ ...caixa, marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 80px', gap: 10 }}>
                  <input style={inputStyle} placeholder="Nome do país" value={novoPais.nome} onChange={e => setNovoPais({ ...novoPais, nome: e.target.value })} />
                  <input style={inputStyle} placeholder="Sigla" maxLength={3} value={novoPais.sigla} onChange={e => setNovoPais({ ...novoPais, sigla: e.target.value.toUpperCase() })} />
                  <input style={inputStyle} placeholder="DDI" maxLength={6} value={novoPais.ddi} onChange={e => setNovoPais({ ...novoPais, ddi: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button type="button" style={{ ...btnPrimary, padding: '6px 16px', fontSize: 12 }} onClick={salvarPais}>Salvar país</button>
                  <button type="button" style={{ ...btnCancel, padding: '6px 16px', fontSize: 12 }} onClick={() => setNovoPais(null)}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" style={{ ...btnPrimary, padding: '6px 16px', fontSize: 12 }} onClick={salvarEstado}>Salvar estado</button>
              <button type="button" style={{ ...btnCancel, padding: '6px 16px', fontSize: 12 }} onClick={() => { setNovoEstado(null); setNovoPais(null); }}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button type="button" style={{ ...btnPrimary, opacity: salvando ? 0.6 : 1 }} disabled={salvando} onClick={salvar}>
            {salvando ? 'Salvando...' : 'Salvar cidade'}
          </button>
          <button type="button" style={btnCancel} onClick={onFechar}>Cancelar</button>
        </div>
      </div>
    </ModalCadastro>
  );
}
