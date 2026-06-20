import { supabase } from '../config/supabase.js';

export class CategoryService {
  static async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }
}
