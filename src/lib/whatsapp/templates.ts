import { Sale, Customer, App } from '../../types';
import { formatCurrency, formatDateTime } from '../format';

export function createOrderConfirmationMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): string {
  const items = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    return `${app?.name || 'Aplicativo'} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
  }).join('\n');

  return `Olá ${customer.name}! 🎉

Seu pedido foi confirmado com sucesso!

*Detalhes do Pedido:*
Data: ${formatDateTime(sale.date)}
${items}

*Total: ${formatCurrency(sale.totalPrice)}*

Os códigos serão enviados em breve.

Agradecemos a preferência! 🙏`;
}

export function createOrderCodesMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): string {
  const itemsWithCodes = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    const codes = item.codes?.length 
      ? `\nCódigos:\n${item.codes.join('\n')}`
      : '';
    
    return `${app?.name || 'Aplicativo'} x${item.quantity}${codes}`;
  }).join('\n\n');

  return `Olá ${customer.name}! 🎉

Aqui estão os códigos do seu pedido:

${itemsWithCodes}

Aproveite! 🎮

Em caso de dúvidas, estamos à disposição.
Obrigado pela preferência! 🙏`;
}