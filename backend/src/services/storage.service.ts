import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  static async uploadFile(bucket: string, file: Express.Multer.File): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }

  static async deleteFile(bucket: string, fileUrl: string): Promise<void> {
    try {
      // Parse file name from URL
      const parts = fileUrl.split('/');
      const fileName = parts[parts.length - 1];
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);
      
      if (error) {
        console.error(`Failed to delete file ${fileName} from ${bucket}:`, error.message);
      }
    } catch (err: any) {
      console.error('Error parsing file URL for deletion:', err.message);
    }
  }
}
