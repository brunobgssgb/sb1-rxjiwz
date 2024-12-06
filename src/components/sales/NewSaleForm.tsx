import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SaleItemForm } from './SaleItemForm';
import { SaleSummary } from './SaleSummary';
import * as comboService from '../../services/combo.service';
import { AppCombo } from '../../types';

interface NewSaleFormProps {
  onSuccess: () => void;
}

export function NewSaleForm({ onSuccess }: NewSaleFormProps) {
  const { customers, apps, addSale } = useStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<Array<{
    appId: string;
    quantity: number;
    price: number;
    isCombo?: boolean;
    comboId?: string;
  }>>([]);
  const [combos, setCombos] = useState<AppCombo[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      const fetchedCombos = await comboService.getCombos();
      setCombos(fetchedCombos);
    } catch (err) {
      console.error('Error loading combos:', err);
      setError('Erro ao carregar combos');
    }
  };

  const addItem = () => {
    setItems([...items, { appId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number | boolean) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!selectedCustomerId || items.length === 0) {
        throw new Error('Por favor, selecione um cliente e adicione pelo menos um item.');
      }

      // Process combo items
      const processedItems = items.map(item => {
        if (item.isCombo) {
          const combo = combos.find(c => c.id === item.comboId);
          if (!combo) {
            throw new Error('Combo não encontrado');
          }
          return {
            comboId: combo.id,
            appId: combo.id, // We'll use this to identify it's a combo
            quantity: item.quantity,
            price: combo.price,
            isCombo: true
          };
        }
        return item;
      });

      const success = await addSale(selectedCustomerId, processedItems);
      
      if (success) {
        onSuccess();
      } else {
        setError('Não há códigos suficientes disponíveis para um ou mais aplicativos selecionados.');
      }
    } catch (err) {
      console.error('Error creating sale:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar venda');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-gray-900">Nova Venda</h2>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <FormField label="Cliente" required>
            <select
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Selecione o Cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {items.map((item, index) => (
              <SaleItemForm
                key={index}
                item={item}
                apps={apps}
                combos={combos}
                onUpdate={(field, value) => updateItem(index, field, value)}
                onRemove={() => removeItem(index)}
              />
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <SaleSummary items={items} apps={apps} combos={combos} />
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !selectedCustomerId || items.length === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isLoading ? 'Processando...' : 'Finalizar Venda'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}