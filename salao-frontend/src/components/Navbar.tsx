import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Agendamentos', path: '/agendamentos' },
    { label: 'Categorias', path: '/categorias' },
    { label: 'Serviços', path: '/servicos' },
    { label: 'Produtos', path: '/produtos' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Funcionários', path: '/funcionarios' },
    { label: 'Países', path: '/paises' },
    { label: 'Estados', path: '/estados' },
    { label: 'Cidades', path: '/cidades' },
    { label: 'Formas Pgto', path: '/formas-pagamento' },
    { label: 'Condições Pgto', path: '/condicoes-pagamento' },
    { label: 'Parcelas', path: '/parcelas' },
  ];

  return (
    <nav style={{
      backgroundColor: '#3D2B1F',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 22,
          color: '#C97B63',
          fontStyle: 'italic',
          letterSpacing: 1
        }}>
          ✦ Salão
        </span>
        <span style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 22,
          color: '#FAF7F4',
          letterSpacing: 1
        }}>
          Bella
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {links.map(link => (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: location.pathname.startsWith(link.path) ? '#C97B63' : '#F5EDE3',
              fontSize: 14,
              fontFamily: 'Lato, sans-serif',
              fontWeight: location.pathname.startsWith(link.path) ? 700 : 400,
              padding: '8px 16px',
              borderBottom: location.pathname.startsWith(link.path) ? '2px solid #C97B63' : '2px solid transparent',
              transition: 'all 0.2s',
              letterSpacing: 0.5
            }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  );
}