import { supabase } from '../supabase';

export interface WhatsAppConfig {
  whatsappSecret: string | null;
  whatsappAccount: string | null;
}

export async function getWhatsAppConfig(userId: string): Promise<WhatsAppConfig> {
  const { data, error } = await supabase
    .from('users')
    .select('whatsapp_secret, whatsapp_account')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to get WhatsApp config:', error);
    throw new Error('Falha ao obter configurações do WhatsApp');
  }

  return {
    whatsappSecret: data?.whatsapp_secret || null,
    whatsappAccount: data?.whatsapp_account || null
  };
}

export async function updateWhatsAppConfig(
  userId: string,
  config: WhatsAppConfig
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      whatsapp_secret: config.whatsappSecret,
      whatsapp_account: config.whatsappAccount
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update WhatsApp config:', error);
    throw new Error('Falha ao atualizar configurações do WhatsApp');
  }
}