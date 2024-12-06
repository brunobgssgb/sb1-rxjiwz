import React from 'react';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';
import { App, AppCombo } from '../../types';

interface SaleItemFormProps {
  item: {
    appId: string;
    quantity: number;
    price: number;
    isCombo?: boolean;
    comboId?: string;
  };
  apps: App[];
  combos: AppCombo[];
  onUpdate: (field: string, value: string | number | boolean) => void;
  onRemove: () => void;
}

export function SaleItemForm({ item, apps, combos, onUpdate, onRemove }: SaleItemFormProps) {
  const handleTypeChange = (type: 'app' | 'combo') => {
    const isCombo = type === 'combo';
    onUpdate('isCombo', isCombo);
    // Reset selection and price when changing type
    if (isCombo) {
      onUpdate('appId', '');
      onUpdate('comboId', '');
      onUpdate('price', 0);
    } else {
      onUpdate('comboId', '');
      onUpdate('appId', '');
      onUpdate('price', 0);
    }
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (item.isCombo) {
      const combo = combos.find(c => c.id === value);
      onUpdate('comboId', value);
      onUpdate('price', combo?.price || 0);
    } else {
      const app = apps.find(a => a.id === value);
      onUpdate('appId', value);
      onUpdate('price', app?.price || 0);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border rounded-lg p-4">
      <div className="md:col-span-3">
        <FormField label="Tipo" required>
          <select
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={item.isCombo ? 'combo' : 'app'}
            onChange={(e) => handleTypeChange(e.target.value as 'app' | 'combo')}
          >
            <option value="app">Aplicativo</option>
            <option value="combo">Combo</option>
          </select>
        </FormField>
      </div>

      <div className="md:col-span-5">
        <FormField label={item.isCombo ? "Combo" : "Aplicativo"} required>
          <select
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={item.isCombo ? item.comboId : item.appId}
            onChange={handleSelectionChange}
            required
          >
            <option value="">Selecione {item.isCombo ? "o Combo" : "o Aplicativo"}</option>
            {item.isCombo ? (
              combos.map((combo) => (
                <option key={combo.id} value={combo.id}>
                  {combo.name} - {combo.apps.length} apps - R$ {combo.price.toFixed(2)}
                </option>
              ))
            ) : (
              apps.map((app) => (
                <option 
                  key={app.id} 
                  value={app.id} 
                  disabled={app.codesAvailable < 1}
                >
                  {app.name} (R$ {app.price.toFixed(2)}) - {app.codesAvailable} códigos disponíveis
                </option>
              ))
            )}
          </select>
        </FormField>
      </div>

      <div className="md:col-span-3">
        <FormField label="Quantidade" required>
          <Input
            type="number"
            min="1"
            max={!item.isCombo && item.appId ? 
              apps.find(a => a.id === item.appId)?.codesAvailable : 
              undefined}
            value={item.quantity}
            onChange={(e) => onUpdate('quantity', parseInt(e.target.value) || 1)}
            required
          />
        </FormField>
      </div>

      <div className="md:col-span-1">
        <Button
          type="button"
          variant="destructive"
          onClick={onRemove}
          className="w-full"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}