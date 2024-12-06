import { validateWhatsAppConfig, validatePhoneNumber, validateMessage } from './validation';

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  secret: string | null | undefined,
  account: string | null | undefined,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    validateWhatsAppConfig(secret, account);
    const cleanPhone = validatePhoneNumber(phone);
    const validMessage = validateMessage(message);

    const data = {
      secret,
      account,
      priority: 1,
      recipient: cleanPhone,
      type: 'text',
      message: validMessage
    };

    const response = await fetch('https://envia.recargasmax.com.br/api/send/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data)
    });

    const result: WhatsAppResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || `Erro ${response.status}: Falha ao enviar mensagem`);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
    }
    throw new Error('Erro inesperado ao enviar mensagem WhatsApp');
  }
}