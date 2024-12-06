import { supabase } from '../lib/supabase';
import { Sale, SaleItem } from '../types';
import { useAuthStore } from '../store/authStore';
import { sendOrderConfirmationMessage, sendOrderCodesMessage } from '../lib/whatsapp/messages';

export async function createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: saleData, error: saleError } = await supabase
    .from('sales')
    .insert({
      customer_id: sale.customerId,
      total_price: sale.totalPrice,
      status: sale.status || 'pending',
      user_id: currentUser.id
    })
    .select()
    .single();

  if (saleError) {
    console.error('Failed to create sale:', saleError);
    throw new Error('Falha ao criar venda');
  }

  const saleItems = [];
  for (const item of sale.items) {
    const { data: saleItem, error: saleItemError } = await supabase
      .from('sale_items')
      .insert({
        sale_id: saleData.id,
        app_id: item.appId,
        quantity: item.quantity,
        price: item.price
      })
      .select()
      .single();

    if (saleItemError) {
      console.error('Failed to create sale item:', saleItemError);
      throw new Error('Falha ao criar item da venda');
    }
    
    saleItems.push({
      ...item,
      codes: []
    });
  }

  const newSale = {
    id: saleData.id,
    userId: currentUser.id,
    customerId: saleData.customer_id,
    totalPrice: saleData.total_price,
    date: saleData.date,
    status: saleData.status,
    items: saleItems
  };

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', newSale.customerId)
      .single();

    const { data: apps } = await supabase
      .from('apps')
      .select('*');

    if (customer && apps) {
      await sendOrderConfirmationMessage(newSale, customer, apps);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    // Don't throw here - we want the sale to be created even if WhatsApp fails
  }

  return newSale;
}

// Rest of the file remains unchanged