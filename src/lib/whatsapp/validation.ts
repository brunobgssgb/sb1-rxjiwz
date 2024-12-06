import { Sale, Customer, App } from '../../types';

export function validateWhatsAppConfig(secret?: string | null, account?: string | null): void {
  if (!secret || !account) {
    throw new Error('Configurações do WhatsApp não encontradas. Por favor, configure em sua conta.');
  }
}

export function validatePhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error(`Número de telefone inválido: ${phone}`);
  }
  return cleanPhone;
}

export function validateMessage(message: string): string {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new Error('Mensagem não pode estar vazia');
  }
  return trimmedMessage;
}

export function validateSaleData(sale: Sale, customer: Customer, apps: App[]): void {
  if (!sale.userId) {
    throw new Error('ID do usuário não encontrado na venda');
  }

  if (!customer) {
    throw new Error('Cliente não encontrado');
  }

  if (!customer.phone) {
    throw new Error('Telefone do cliente não encontrado');
  }

  if (!sale.items?.length) {
    throw new Error('Venda não possui itens');
  }

  const invalidApps = sale.items.filter(item => !apps.find(a => a.id === item.appId));
  if (invalidApps.length > 0) {
    throw new Error('Um ou mais aplicativos não foram encontrados');
  }
}