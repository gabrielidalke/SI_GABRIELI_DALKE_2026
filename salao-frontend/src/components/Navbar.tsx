import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={{
      background: '#333',
      padding: '12px 24px',
      display: 'flex',
      gap: 16
    }}>
        <button onClick={() => navigate('/produtos')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
  Produtos
</button>
      <button onClick={() => navigate('/categorias')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        Categorias
      </button>
      <button onClick={() => navigate('/servicos')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
        Serviços
      </button>
      <button onClick={() => navigate('/clientes')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
  Clientes
</button>
<button onClick={() => navigate('/funcionarios')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
  Funcionários
</button>
    </nav>
  );
}