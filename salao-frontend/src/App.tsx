import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoriaList from './pages/categoria/CategoriaList';
import CategoriaForm from './pages/categoria/CategoriaForm';
import ServicoList from './pages/servico/ServicoList';
import ServicoForm from './pages/servico/ServicoForm';
import ProdutoList from './pages/produto/ProdutoList';
import ProdutoForm from './pages/produto/ProdutoForm';
import ClienteList from './pages/cliente/ClienteList';
import ClienteForm from './pages/cliente/ClienteForm';
import FuncionarioList from './pages/funcionario/FuncionarioList';
import FuncionarioForm from './pages/funcionario/FuncionarioForm';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/categorias" />} />
        <Route path="/categorias" element={<CategoriaList />} />
        <Route path="/categorias/nova" element={<CategoriaForm />} />
        <Route path="/categorias/:id" element={<CategoriaForm />} />
        <Route path="/servicos" element={<ServicoList />} />
        <Route path="/servicos/novo" element={<ServicoForm />} />
        <Route path="/servicos/:id" element={<ServicoForm />} />
        <Route path="/produtos" element={<ProdutoList />} />
        <Route path="/produtos/novo" element={<ProdutoForm />} />
        <Route path="/produtos/:id" element={<ProdutoForm />} />
        <Route path="/clientes" element={<ClienteList />} />
        <Route path="/clientes/novo" element={<ClienteForm />} />
        <Route path="/clientes/:id" element={<ClienteForm />} />
        <Route path="/funcionarios" element={<FuncionarioList />} />
        <Route path="/funcionarios/novo" element={<FuncionarioForm />} />
        <Route path="/funcionarios/:id" element={<FuncionarioForm />} />
      </Routes>
    </BrowserRouter>
  );
}