import React, { useState } from 'react';
import { Sale, Customer, App } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check, X, Trash2, AlertCircle, Edit, Send } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { Toast } from '../ui/Toast';
import { formatCurrency, formatDateTime } from '../../lib/format';
import { resendOrderCodes } from '../../lib/whatsapp/messages';
import { useToast } from '../../hooks/useToast';

interface SalesListProps {
  sales: Sale[];
  customers: Customer[];
  apps: App[];
  onConfirm: (saleId: string) => void;
  onCancel: (saleId: string) => void;
  onDelete: (saleId: string) => void;
  onEdit: (saleId: string) => void;
}

export function SalesList({ 
  sales, 
  customers, 
  apps, 
  onConfirm,
  onCancel,
  onDelete,
  onEdit
}: SalesListProps) {
  const [resending, setResending] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const sortedSales = [...sales].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusColor = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusText = (status: Sale['status']) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  const handleResendCodes = async (sale: Sale) => {
    if (resending) return;
    setResending(sale.id);

    try {
      const customer = customers.find(c => c.id === sale.customerId);
      if (!customer) {
        throw new Error('Cliente não encontrado');
      }

      await resendOrderCodes(sale, customer, apps);
      showToast('Códigos reenviados com sucesso!', 'success');
    } catch (err) {
      console.error('Error resending codes:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erro ao reenviar códigos. Verifique suas configurações do WhatsApp.';
      showToast(errorMessage, 'error');
    } finally {
      setResending(null);
    }
  };

  if (!sales.length) {
    return (
      <Card>
        <Card.Content>
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma venda registrada</p>
          </div>
        </Card.Content>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-900">
            Histórico de Vendas
          </h2>
        </Card.Header>
        <Card.Content>
          <div className="space-y-6">
            {sortedSales.map((sale) => {
              const customer = customers.find(c => c.id === sale.customerId);
              const totalPrice = typeof sale.totalPrice === 'number' ? sale.totalPrice : 0;
              
              return (
                <div key={sale.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {customer?.name || 'Cliente não encontrado'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(sale.date)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sale.status)}`}>
                      {getStatusText(sale.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {sale.items?.map((item, index) => {
                      const app = apps.find(a => a.id === item.appId);
                      const itemTotal = (item.price || 0) * (item.quantity || 0);
                      return (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{app?.name || 'Aplicativo não encontrado'} x{item.quantity || 0}</span>
                          <span>{formatCurrency(itemTotal)}</span>
                        </div>
                      );
                    })}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    {sale.status === 'pending' && (
                      <>
                        <Tooltip content="Confirmar Venda">
                          <Button
                            variant="outline"
                            onClick={() => onConfirm(sale.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Cancelar Venda">
                          <Button
                            variant="outline"
                            onClick={() => onCancel(sale.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Editar Venda">
                          <Button
                            variant="outline"
                            onClick={() => onEdit(sale.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {sale.status === 'confirmed' && sale.items?.some(item => item.codes?.length > 0) && (
                      <Tooltip content="Reenviar Códigos">
                        <Button
                          variant="outline"
                          onClick={() => handleResendCodes(sale)}
                          disabled={resending === sale.id}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Send className={`w-4 h-4 ${resending === sale.id ? 'animate-spin' : ''}`} />
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip content="Excluir Venda">
                      <Button
                        variant="outline"
                        onClick={() => onDelete(sale.id)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </div>

                  {sale.status === 'confirmed' && sale.items?.some(item => item.codes?.length > 0) && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Códigos</h4>
                      <div className="space-y-2">
                        {sale.items.map((item, index) => {
                          const app = apps.find(a => a.id === item.appId);
                          if (!item.codes?.length) return null;
                          return (
                            <div key={index} className="text-sm">
                              <p className="font-medium text-gray-700">{app?.name}:</p>
                              <div className="mt-1 space-y-1">
                                {item.codes.map((code, codeIndex) => (
                                  <p key={codeIndex} className="font-mono text-gray-600">{code}</p>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
    </>
  );
}