import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CategoriaList from './pages/categoria/CategoriaList';
import CategoriaForm from './pages/categoria/CategoriaForm';
import ServicoList from './pages/servico/ServicoList';
import ServicoForm from './pages/servico/ServicoForm';
import Produtos from './pages/Produtos';
import Marcas from './pages/Marcas';
import UnidadesMedida from './pages/UnidadesMedida';
import ClienteList from './pages/cliente/ClienteList';
import ClienteForm from './pages/cliente/ClienteForm';
import FuncionarioList from './pages/funcionario/FuncionarioList';
import FuncionarioForm from './pages/funcionario/FuncionarioForm';
import Paises from './pages/Paises';
import Estados from './pages/Estados';
import Cidades from './pages/Cidades';
import AgendamentoPage from './pages/agendamento/AgendamentoPage';
import FormasPagamento from './pages/FormasPagamento';
import CondicoesPagamento from './pages/CondicoesPagamento';
import CondicaoPagamentoForm from './pages/condicao/CondicaoPagamentoForm';
import Fornecedores from './pages/Fornecedores';
import FornecedorForm from './pages/fornecedor/FornecedorForm';
import ContasPagar from './pages/ContasPagar';
import ContasReceber from './pages/ContasReceber';
import NcmSh from './pages/NcmSh';
import Compras from './pages/Compras';
import NotasFiscaisEntrada from './pages/NotasFiscaisEntrada';
import Vendas from './pages/Vendas';
import NotasFiscaisSaida from './pages/NotasFiscaisSaida';
import NotasFiscaisServico from './pages/NotasFiscaisServico';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ marginLeft: 220, flex: 1, minWidth: 0, minHeight: '100vh', backgroundColor: '#FDF6F0', overflowY: 'auto', boxSizing: 'border-box' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/agendamentos" />} />
            <Route path="/agendamentos" element={<AgendamentoPage />} />
            <Route path="/categorias" element={<CategoriaList />} />
            <Route path="/categorias/nova" element={<CategoriaForm />} />
            <Route path="/categorias/:id" element={<CategoriaForm />} />
            <Route path="/servicos" element={<ServicoList />} />
            <Route path="/servicos/novo" element={<ServicoForm />} />
            <Route path="/servicos/:id" element={<ServicoForm />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/marcas" element={<Marcas />} />
            <Route path="/unidades-medida" element={<UnidadesMedida />} />
            <Route path="/clientes" element={<ClienteList />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/editar/:id" element={<ClienteForm />} />
            <Route path="/funcionarios" element={<FuncionarioList />} />
            <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
            <Route path="/funcionarios/:id" element={<FuncionarioForm />} />
            <Route path="/paises" element={<Paises />} />
            <Route path="/estados" element={<Estados />} />
            <Route path="/cidades" element={<Cidades />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/fornecedores/novo" element={<FornecedorForm />} />
            <Route path="/fornecedores/editar/:id" element={<FornecedorForm />} />
            <Route path="/formas-pagamento" element={<FormasPagamento />} />
            <Route path="/condicoes-pagamento" element={<CondicoesPagamento />} />
            <Route path="/condicoes-pagamento/nova" element={<CondicaoPagamentoForm />} />
            <Route path="/condicoes-pagamento/editar/:id" element={<CondicaoPagamentoForm />} />
            <Route path="/contas-pagar" element={<ContasPagar />} />
            <Route path="/contas-receber" element={<ContasReceber />} />
            <Route path="/ncm-sh" element={<NcmSh />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/notas-fiscais-entrada" element={<NotasFiscaisEntrada />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/notas-fiscais-saida" element={<NotasFiscaisSaida />} />
            <Route path="/notas-fiscais-servico" element={<NotasFiscaisServico />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
