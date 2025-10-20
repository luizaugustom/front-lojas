// Exemplo de uso do DeleteSellerModal

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteSellerModal } from '@/components/sellers/delete-seller-modal';
import type { Seller } from '@/types';

// Exemplo de dados de vendedor
const exampleSeller: Seller = {
  id: '1',
  login: 'vendedor@empresa.com',
  name: 'João Silva',
  cpf: '123.456.789-00',
  email: 'joao@example.com',
  phone: '(11) 99999-9999',
  companyId: 'company-1',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  totalSales: 25,
  totalRevenue: 15000.50,
  averageSaleValue: 600.02,
};

export function ExampleUsage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteSuccess = () => {
    console.log('Vendedor excluído com sucesso!');
    // Aqui você pode atualizar a lista de vendedores
    // ou fazer qualquer outra ação necessária
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exemplo de Uso do Modal de Exclusão</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Vendedor:</h3>
        <p><strong>Nome:</strong> {exampleSeller.name}</p>
        <p><strong>Login:</strong> {exampleSeller.login}</p>
        <p><strong>Email:</strong> {exampleSeller.email}</p>
        <p><strong>Vendas:</strong> {exampleSeller.totalSales}</p>
        <p><strong>Faturamento:</strong> R$ {exampleSeller.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </div>

      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        Excluir Vendedor
      </Button>

      <DeleteSellerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        seller={exampleSeller}
      />
    </div>
  );
}


