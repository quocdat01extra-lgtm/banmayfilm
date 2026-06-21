import { supabase } from '../config/supabase.js';

export interface ReviewInput {
  product_id: string;
  phone: string;
  rating: number;
  content: string;
}

export class ReviewService {
  static async getByProductId(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getAverageByProductId(productId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average_rating: 0, total_reviews: 0 };
    }

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average_rating = Number((sum / data.length).toFixed(1));

    return {
      average_rating,
      total_reviews: data.length
    };
  }

  static async create(review: ReviewInput) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
