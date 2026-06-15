import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Users, UserCheck, Scissors, Package, Tag, Truck,
  CreditCard, MapPin, ChevronDown, ChevronUp,
  ArrowDownCircle, ArrowUpCircle, FileText,
} from 'lucide-react';

const financeiroRotas = ['/formas-pagamento', '/condicoes-pagamento', '/parcelas', '/contas-pagar', '/contas-receber'];
const localizacaoRotas = ['/paises', '/estados', '/cidades'];
const fiscalRotas = ['/compras', '/notas-fiscais-entrada', '/vendas', '/notas-fiscais-saida', '/notas-fiscais-servico', '/ncm-sh'];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [financeiroAberto, setFinanceiroAberto] = useState(() =>
    financeiroRotas.some(p => location.pathname.startsWith(p))
  );
  const [localizacaoAberto, setLocalizacaoAberto] = useState(() =>
    localizacaoRotas.some(p => location.pathname.startsWith(p))
  );
  const [fiscalAberto, setFiscalAberto] = useState(() =>
    fiscalRotas.some(p => location.pathname.startsWith(p))
  );

  const ativo = (path: string) => location.pathname.startsWith(path);

  const mainItems = [
    { label: 'Agendamentos', path: '/agendamentos', icon: <Calendar size={16} /> },
    { label: 'Clientes',     path: '/clientes',     icon: <Users size={16} /> },
    { label: 'Funcionários', path: '/funcionarios', icon: <UserCheck size={16} /> },
    { label: 'Serviços',     path: '/servicos',     icon: <Scissors size={16} /> },
    { label: 'Produtos',     path: '/produtos',     icon: <Package size={16} /> },
    { label: 'Categorias',   path: '/categorias',   icon: <Tag size={16} /> },
    { label: 'Fornecedores', path: '/fornecedores', icon: <Truck size={16} /> },
  ];

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: 220,
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #F0E6DC',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid #F0E6DC' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#C97B6B', fontStyle: 'italic' }}>✦ Salão</span>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#3D2B1F' }}>Bella</span>
        </div>
        <p style={{ fontSize: 11, color: '#8B6E63', marginTop: 3, letterSpacing: 0.5 }}>Sistema de Gestão</p>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {mainItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`sidebar-item${ativo(item.path) ? ' active' : ''}`}
          >
            <span className="item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{ height: 1, backgroundColor: '#F0E6DC', margin: '10px 8px' }} />

        {/* Financeiro */}
        <button
          onClick={() => setFinanceiroAberto(v => !v)}
          className="sidebar-group"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="item-icon"><CreditCard size={16} /></span>
            Financeiro
          </div>
          <span className="item-icon">
            {financeiroAberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>
        {financeiroAberto && (
          <div>
            {[
              { label: 'Formas de Pgto',    path: '/formas-pagamento',   icon: undefined as JSX.Element | undefined },
              { label: 'Condições de Pgto', path: '/condicoes-pagamento', icon: undefined as JSX.Element | undefined },
              { label: 'Parcelas',          path: '/parcelas',            icon: undefined as JSX.Element | undefined },
              { label: 'Contas a Pagar',    path: '/contas-pagar',        icon: <ArrowDownCircle size={13} /> as JSX.Element | undefined },
              { label: 'Contas a Receber',  path: '/contas-receber',      icon: <ArrowUpCircle size={13} />  as JSX.Element | undefined },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-sub${ativo(item.path) ? ' active' : ''}`}
              >
                {item.icon && <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 5 }}>{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: '#F0E6DC', margin: '10px 8px' }} />

        {/* Localização */}
        <button
          onClick={() => setLocalizacaoAberto(v => !v)}
          className="sidebar-group"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="item-icon"><MapPin size={16} /></span>
            Localização
          </div>
          <span className="item-icon">
            {localizacaoAberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>
        {localizacaoAberto && (
          <div>
            {[
              { label: 'Países',  path: '/paises' },
              { label: 'Estados', path: '/estados' },
              { label: 'Cidades', path: '/cidades' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-sub${ativo(item.path) ? ' active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ height: 1, backgroundColor: '#F0E6DC', margin: '10px 8px' }} />

        {/* Fiscal */}
        <button
          onClick={() => setFiscalAberto(v => !v)}
          className="sidebar-group"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="item-icon"><FileText size={16} /></span>
            Fiscal
          </div>
          <span className="item-icon">
            {fiscalAberto ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>
        {fiscalAberto && (
          <div>
            {[
              { label: 'Compras',                 path: '/compras' },
              { label: 'Notas Fiscais Entrada',   path: '/notas-fiscais-entrada' },
              { label: 'Vendas',                   path: '/vendas' },
              { label: 'Notas Fiscais de Saída',   path: '/notas-fiscais-saida' },
              { label: 'Notas Fiscais de Serviço', path: '/notas-fiscais-servico' },
              { label: 'NCM / SH',                 path: '/ncm-sh' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`sidebar-sub${ativo(item.path) ? ' active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
