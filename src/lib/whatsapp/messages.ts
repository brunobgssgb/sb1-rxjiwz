import { Sale, Customer, App } from '../../types';
import { validateSaleData } from './validation';
import { createOrderConfirmationMessage, createOrderCodesMessage } from './templates';
import { sendWhatsAppMessage } from './api';
import { getWhatsAppConfig } from './config';

export async function sendOrderConfirmationMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  try {
    validateSaleData(sale, customer, apps);
    const config = await getWhatsAppConfig(sale.userId!);
    const message = createOrderConfirmationMessage(sale, customer, apps);
    
    return await sendWhatsAppMessage(
      config.whatsappSecret,
      config.whatsappAccount,
      customer.phone,
      message
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao enviar confirmação: ${error.message}`);
    }
    throw new Error('Erro inesperado ao enviar confirmação do pedido');
  }
}

export async function sendOrderCodesMessage(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  try {
    validateSaleData(sale, customer, apps);
    const config = await getWhatsAppConfig(sale.userId!);
    const message = createOrderCodesMessage(sale, customer, apps);

    return await sendWhatsAppMessage(
      config.whatsappSecret,
      config.whatsappAccount,
      customer.phone,
      message
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao enviar códigos: ${error.message}`);
    }
    throw new Error('Erro inesperado ao enviar códigos do pedido');
  }
}

export async function resendOrderCodes(
  sale: Sale,
  customer: Customer,
  apps: App[]
): Promise<boolean> {
  try {
    if (!sale.items?.some(item => item.codes?.length > 0)) {
      throw new Error('Esta venda não possui códigos para reenviar');
    }

    validateSaleData(sale, customer, apps);
    return sendOrderCodesMessage(sale, customer, apps);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao reenviar códigos: ${error.message}`);
    }
    throw new Error('Erro inesperado ao reenviar códigos');
  }
}