import React from 'react';
import { AppCombo } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Trash2, Package } from 'lucide-react';
import { formatCurrency } from '../../lib/format';

interface CombosListProps {
  combos: AppCombo[];
  onDelete: (id: string) => void;
}

export function CombosList({ combos, onDelete }: CombosListProps) {
  if (!combos.length) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-6">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum combo cadastrado</p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold text-gray-900">
          Combos Cadastrados
        </h2>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h3 className="font-medium text-gray-900">{combo.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {combo.apps.map(app => app.name).join(' + ')}
                </p>
                <p className="text-lg font-semibold text-green-600 mt-2">
                  {formatCurrency(combo.price)}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => onDelete(combo.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}