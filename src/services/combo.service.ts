import { supabase } from '../lib/supabase';
import { AppCombo, App } from '../types';
import { useAuthStore } from '../store/authStore';

export async function createCombo(
  name: string,
  price: number,
  appIds: string[]
): Promise<AppCombo> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  // Start a transaction
  const { data: combo, error: comboError } = await supabase
    .from('app_combos')
    .insert({
      name,
      price,
      user_id: currentUser.id
    })
    .select()
    .single();

  if (comboError) {
    console.error('Failed to create combo:', comboError);
    throw new Error('Falha ao criar combo');
  }

  // Insert combo items
  const { error: itemsError } = await supabase
    .from('app_combo_items')
    .insert(
      appIds.map(appId => ({
        combo_id: combo.id,
        app_id: appId
      }))
    );

  if (itemsError) {
    console.error('Failed to create combo items:', itemsError);
    throw new Error('Falha ao adicionar apps ao combo');
  }

  // Get apps data
  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .in('id', appIds);

  if (appsError) {
    console.error('Failed to fetch combo apps:', appsError);
    throw new Error('Falha ao buscar apps do combo');
  }

  return {
    id: combo.id,
    userId: currentUser.id,
    name: combo.name,
    price: combo.price,
    apps: apps as App[]
  };
}

export async function getCombos(): Promise<AppCombo[]> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { data: combos, error: combosError } = await supabase
    .from('app_combos')
    .select(`
      *,
      app_combo_items (
        apps (*)
      )
    `)
    .eq('user_id', currentUser.id);

  if (combosError) {
    console.error('Failed to fetch combos:', combosError);
    throw new Error('Falha ao buscar combos');
  }

  return combos.map(combo => ({
    id: combo.id,
    userId: combo.user_id,
    name: combo.name,
    price: combo.price,
    apps: combo.app_combo_items.map((item: any) => item.apps)
  }));
}

export async function deleteCombo(id: string): Promise<void> {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('app_combos')
    .delete()
    .eq('id', id)
    .eq('user_id', currentUser.id);

  if (error) {
    console.error('Failed to delete combo:', error);
    throw new Error('Falha ao excluir combo');
  }
}