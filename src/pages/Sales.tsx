import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Plus, X } from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer';
import { SalesList } from '../components/sales/SalesList';
import { NewSaleForm } from '../components/sales/NewSaleForm';
import { EditSaleForm } from '../components/sales/EditSaleForm';

export function Sales() {
  const { customers, apps, sales, confirmSale, updateSale, deleteSale } = useStore();
  const [showNewSaleForm, setShowNewSaleForm] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);

  const handleSaleConfirm = async (saleId: string) => {
    try {
      await confirmSale(saleId);
    } catch (error) {
      console.error('Error confirming sale:', error);
      alert('Erro ao confirmar venda. Por favor, tente novamente.');
    }
  };

  const handleSaleCancel = async (saleId: string) => {
    try {
      await updateSale(saleId, { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling sale:', error);
      alert('Erro ao cancelar venda. Por favor, tente novamente.');
    }
  };

  const handleSaleDelete = async (saleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      try {
        await deleteSale(saleId);
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Erro ao excluir venda. Por favor, tente novamente.');
      }
    }
  };

  return (
    <PageContainer 
      title="Gerenciamento de Vendas"
      description="Registre e gerencie suas vendas"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setShowNewSaleForm(!showNewSaleForm)}>
            {showNewSaleForm ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </>
            )}
          </Button>
        </div>

        {showNewSaleForm && (
          <NewSaleForm 
            onSuccess={() => setShowNewSaleForm(false)}
          />
        )}

        {editingSaleId && (
          <EditSaleForm
            saleId={editingSaleId}
            onCancel={() => setEditingSaleId(null)}
            onSuccess={() => setEditingSaleId(null)}
          />
        )}

        <SalesList 
          sales={sales}
          customers={customers}
          apps={apps}
          onConfirm={handleSaleConfirm}
          onCancel={handleSaleCancel}
          onDelete={handleSaleDelete}
          onEdit={setEditingSaleId}
        />
      </div>
    </PageContainer>
  );
}