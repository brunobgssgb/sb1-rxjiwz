import React, { useState } from 'react';
import { App } from '../../types';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AlertCircle, Plus, X } from 'lucide-react';

interface ComboFormProps {
  apps: App[];
  onSubmit: (data: { name: string; price: number; appIds: string[] }) => Promise<void>;
  onCancel: () => void;
}

export function ComboForm({ apps, onSubmit, onCancel }: ComboFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (selectedApps.length < 2) {
        throw new Error('Selecione pelo menos 2 aplicativos para o combo');
      }

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Preço inválido');
      }

      await onSubmit({
        name: name.trim(),
        price: priceValue,
        appIds: selectedApps
      });

      setName('');
      setPrice('');
      setSelectedApps([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar combo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-gray-900">Novo Combo</h2>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome do Combo" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Combo Premium"
              required
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Preço" required>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              disabled={isLoading}
            />
          </FormField>

          <FormField label="Aplicativos" required>
            <div className="space-y-2">
              {apps.map((app) => (
                <label
                  key={app.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedApps.includes(app.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedApps([...selectedApps, app.id]);
                      } else {
                        setSelectedApps(selectedApps.filter(id => id !== app.id));
                      }
                    }}
                    disabled={isLoading}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {app.name} - R$ {app.price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? 'Criando...' : 'Criar Combo'}
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  );
}