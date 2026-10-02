import ModalBusca from './ModalBusca';
import { fornecedorService, type Fornecedor } from '../services/fornecedorService';
import { transportadoraService, type Transportadora } from '../services/transportadoraService';

// Funções fora dos componentes para o ModalBusca não recarregar a lista a cada renderização
const carregarFornecedores = () => fornecedorService.listar().then(r => r.data.filter(f => f.ativo !== false));
const carregarTransportadoras = () => transportadoraService.listar().then(r => r.data.filter(t => t.ativo !== false));

interface PopupProps<T> {
  onSelecionar: (item: T) => void;
  onClose: () => void;
}

export function BuscarFornecedorModal({ onSelecionar, onClose }: PopupProps<Fornecedor>) {
  return (
    <ModalBusca<Fornecedor>
      titulo="Buscar Fornecedor"
      descricao="Escolha um fornecedor ativo. A condição de pagamento cadastrada nele é sugerida automaticamente."
      carregar={carregarFornecedores}
      colunas={[
        { titulo: 'ID', render: f => f.id },
        { titulo: 'Fornecedor', render: f => <strong>{f.fornecedor}</strong> },
        { titulo: 'CPF/CNPJ', render: f => f.cpfCnpj || '—' },
        { titulo: 'Cidade', render: f => f.cidade?.nome || '—' },
        { titulo: 'Condição de Pagamento', render: f => f.condicaoPagamento?.condicao || '—' },
      ]}
      chave={f => f.id}
      texto={f => `${f.id} ${f.fornecedor} ${f.cpfCnpj ?? ''} ${f.cidade?.nome ?? ''}`}
      vazio="Nenhum fornecedor ativo cadastrado."
      onSelecionar={onSelecionar}
      onClose={onClose}
    />
  );
}

export function BuscarTransportadoraModal({ onSelecionar, onClose }: PopupProps<Transportadora>) {
  return (
    <ModalBusca<Transportadora>
      titulo="Buscar Transportadora"
      descricao="Escolha uma transportadora ativa."
      carregar={carregarTransportadoras}
      colunas={[
        { titulo: 'ID', render: t => t.id },
        { titulo: 'Transportadora', render: t => <strong>{t.nome}</strong> },
        { titulo: 'CPF/CNPJ', render: t => t.cpfCnpj || '—' },
        { titulo: 'Cidade', render: t => t.cidade?.nome || '—' },
        { titulo: 'Fone', render: t => t.fone || '—' },
      ]}
      chave={t => t.id}
      texto={t => `${t.id} ${t.nome} ${t.cpfCnpj ?? ''} ${t.cidade?.nome ?? ''}`}
      vazio="Nenhuma transportadora ativa cadastrada."
      onSelecionar={onSelecionar}
      onClose={onClose}
    />
  );
}
