import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // Test database connection and table access
    const results = await Promise.allSettled([
      supabase.from('customers').select('id').limit(1),
      supabase.from('apps').select('id').limit(1),
      supabase.from('codes').select('id').limit(1),
      supabase.from('sales').select('id').limit(1),
      supabase.from('sale_items').select('id').limit(1),
      supabase.from('sale_codes').select('id').limit(1)
    ]);

    // Check for any rejected promises
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error('Falha ao conectar com o banco de dados');
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error('Falha ao inicializar o banco de dados');
  }
}