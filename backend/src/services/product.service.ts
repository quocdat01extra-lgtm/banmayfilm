import { supabase } from '../config/supabase.js';
import { StorageService } from './storage.service.js';
import { ReviewService } from './review.service.js';

export interface ProductInput {
  name: string;
  category_id: string;
  specifications: string;
  price: number;
  quantity: number;
  is_active?: boolean;
}

export class ProductService {
  static async getAll(categoryId?: string) {
    let query = supabase
      .from('products')
      .select('*, categories(id, name), product_media(*)')
      .order('created_at', { ascending: false });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Attach review stats
    const productsWithStats = await Promise.all(
      (data || []).map(async (product) => {
        const stats = await ReviewService.getAverageByProductId(product.id);
        return {
          ...product,
          avg_rating: stats.average_rating,
          total_reviews: stats.total_reviews
        };
      })
    );

    return productsWithStats;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name), product_media(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    const stats = await ReviewService.getAverageByProductId(id);
    return {
      ...data,
      avg_rating: stats.average_rating,
      total_reviews: stats.total_reviews
    };
  }

  static async create(product: ProductInput) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<ProductInput>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    // 1. Get all media first to delete files from storage
    const { data: mediaItems, error: mediaError } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', id);

    if (!mediaError && mediaItems) {
      for (const item of mediaItems) {
        await StorageService.deleteFile('products', item.media_url);
      }
    }

    // 2. Delete product from database (cascade deletes db media entries)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  static async addMedia(productId: string, mediaUrl: string, mediaType: string = 'image', displayOrder: number = 0) {
    const { data, error } = await supabase
      .from('product_media')
      .insert([{
        product_id: productId,
        media_url: mediaUrl,
        media_type: mediaType,
        display_order: displayOrder
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMedia(mediaId: string) {
    // 1. Find media to get storage URL
    const { data: media, error: findError } = await supabase
      .from('product_media')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (findError || !media) {
      throw new Error(`Media not found: ${findError?.message}`);
    }

    // 2. Delete file from storage
    await StorageService.deleteFile('products', media.media_url);

    // 3. Delete row from database
    const { error: deleteError } = await supabase
      .from('product_media')
      .delete()
      .eq('id', mediaId);

    if (deleteError) throw deleteError;
    return true;
  }
}
