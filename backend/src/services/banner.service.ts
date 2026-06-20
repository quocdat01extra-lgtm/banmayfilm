import { supabase } from '../config/supabase.js';
import { StorageService } from './storage.service.js';

export class BannerService {
  static async getAll() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async create(imageUrl: string, displayOrder: number = 0) {
    const { data, error } = await supabase
      .from('banners')
      .insert([{ image_url: imageUrl, display_order: displayOrder }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: { image_url?: string; display_order?: number }) {
    // If updating image_url, optionally delete old file
    if (updates.image_url) {
      try {
        const oldBanner = await this.getById(id);
        if (oldBanner && oldBanner.image_url !== updates.image_url) {
          await StorageService.deleteFile('banners', oldBanner.image_url);
        }
      } catch (err) {
        console.error('Failed to clean up old banner image during update:', err);
      }
    }

    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    try {
      const banner = await this.getById(id);
      if (banner && banner.image_url) {
        await StorageService.deleteFile('banners', banner.image_url);
      }
    } catch (err) {
      console.error('Failed to delete banner file during deletion:', err);
    }

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
