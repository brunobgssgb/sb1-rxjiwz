import { Sale, Customer, App } from '../types';
import { formatCurrency, formatDateTime } from './format';
import { getWhatsAppConfig } from '../services/whatsapp.service';

async function sendWhatsAppMessage(phone: string, message: string, userId: string): Promise<boolean> {
  try {
    const config = await getWhatsAppConfig(userId);
    
    if (!config.whatsappSecret || !config.whatsappAccount) {
      throw new Error('Configurações do WhatsApp não encontradas. Por favor, configure em sua conta.');
    }

    const data = {
      secret: config.whatsappSecret,
      account: config.whatsappAccount,
      priority: 1,
      recipient: phone.replace(/\D/g, ''),
      type: 'text',
      message
    };

    const response = await fetch('https://envia.recargasmax.com.br/api/send/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao enviar mensagem');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Falha ao enviar mensagem');
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export async function sendOrderConfirmationMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.userId) {
    throw new Error('ID do usuário não encontrado na venda');
  }

  const items = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    return `${app?.name || 'Aplicativo'} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`;
  }).join('\n');

  const message = `Olá ${customer.name}! 🎉

Seu pedido foi confirmado com sucesso!

*Detalhes do Pedido:*
Data: ${formatDateTime(sale.date)}
${items}

*Total: ${formatCurrency(sale.totalPrice)}*

Os códigos serão enviados em breve.

Agradecemos a preferência! 🙏`;

  return sendWhatsAppMessage(customer.phone, message, sale.userId);
}

export async function sendOrderCodesMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.userId) {
    throw new Error('ID do usuário não encontrado na venda');
  }

  const itemsWithCodes = sale.items.map(item => {
    const app = apps.find(a => a.id === item.appId);
    const codes = item.codes?.length 
      ? `\nCódigos:\n${item.codes.join('\n')}`
      : '';
    
    return `${app?.name || 'Aplicativo'} x${item.quantity}${codes}`;
  }).join('\n\n');

  const message = `Olá ${customer.name}! 🎉

Aqui estão os códigos do seu pedido:

${itemsWithCodes}

Aproveite! 🎮

Em caso de dúvidas, estamos à disposição.
Obrigado pela preferência! 🙏`;

  return sendWhatsAppMessage(customer.phone, message, sale.userId);
}

export async function resendOrderCodes(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  if (!sale.items?.some(item => item.codes?.length > 0)) {
    throw new Error('Esta venda não possui códigos para reenviar');
  }

  if (!sale.userId) {
    throw new Error('ID do usuário não encontrado na venda');
  }

  return sendOrderCodesMessage(sale, customer, apps);
}