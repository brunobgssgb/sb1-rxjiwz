import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Pencil, Trash2, Search, Plus, Package } from 'lucide-react';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { FormField } from '../components/ui/FormField';
import { ComboForm } from '../components/apps/ComboForm';
import { CombosList } from '../components/apps/CombosList';
import { Toast } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import * as comboService from '../services/combo.service';
import { AppCombo } from '../types';

export function Applications() {
  const { apps, addApp, updateApp, deleteApp } = useStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApp, setNewApp] = useState({ name: '', price: '' });
  const [showComboForm, setShowComboForm] = useState(false);
  const [combos, setCombos] = useState<AppCombo[]>([]);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadCombos();
  }, []);

  const loadCombos = async () => {
    try {
      const fetchedCombos = await comboService.getCombos();
      setCombos(fetchedCombos);
    } catch (error) {
      showToast('Erro ao carregar combos', 'error');
    }
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newApp.price);
    
    if (isNaN(price)) {
      return;
    }

    if (editingId) {
      updateApp(editingId, { ...newApp, price });
      setEditingId(null);
    } else {
      addApp({ ...newApp, price });
    }
    setNewApp({ name: '', price: '' });
  };

  const handleCreateCombo = async (data: { name: string; price: number; appIds: string[] }) => {
    try {
      await comboService.createCombo(data.name, data.price, data.appIds);
      await loadCombos();
      setShowComboForm(false);
      showToast('Combo criado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao criar combo', 'error');
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este combo?')) {
      return;
    }

    try {
      await comboService.deleteCombo(id);
      await loadCombos();
      showToast('Combo excluído com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao excluir combo', 'error');
    }
  };

  return (
    <PageContainer 
      title="Gerenciamento de Aplicativos"
      description="Cadastre e gerencie seus aplicativos e combos"
    >
      <div className="flex justify-end space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setShowComboForm(!showComboForm)}
        >
          <Package className="w-4 h-4 mr-2" />
          {showComboForm ? 'Cancelar Combo' : 'Novo Combo'}
        </Button>
      </div>

      {showComboForm ? (
        <ComboForm
          apps={apps}
          onSubmit={handleCreateCombo}
          onCancel={() => setShowComboForm(false)}
        />
      ) : (
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Editar Aplicativo' : 'Novo Aplicativo'}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar aplicativos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
              <FormField label="Nome" required>
                <Input
                  placeholder="Nome do aplicativo"
                  value={newApp.name}
                  onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
                  required
                />
              </FormField>
              <FormField label="Preço" required>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={newApp.price}
                  onChange={(e) => setNewApp({ ...newApp, price: e.target.value })}
                  required
                />
              </FormField>
              <div className="flex justify-end">
                <Button type="submit">
                  {editingId ? (
                    <>
                      <Pencil className="w-4 h-4 mr-2" />
                      Atualizar Aplicativo
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Aplicativo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      )}

      {combos.length > 0 && (
        <CombosList
          combos={combos}
          onDelete={handleDeleteCombo}
        />
      )}

      <Card>
        <Card.Content>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Códigos Disponíveis
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApps.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      R$ {app.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        app.codesAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {app.codesAvailable}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(app.id);
                          setNewApp({ 
                            name: app.name, 
                            price: app.price.toString() 
                          });
                        }}
                        className="mr-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => deleteApp(app.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </PageContainer>
  );
}