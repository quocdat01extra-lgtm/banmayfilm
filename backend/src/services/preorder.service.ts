import { supabase } from '../config/supabase.js';

export interface OrderInput {
  customer_name: string;
  phone: string;
  city: string;
  delivery_method: string;
  address?: string;
  pickup_datetime?: string;
  payment_method: string;
  note?: string;
  items: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }[];
  total_price: number;
}

export class PreorderService {
  static async create(order: OrderInput) {
    // Insert preorder without checking stock
    const { data, error } = await supabase
      .from('preorders')
      .insert([{
        customer_name: order.customer_name,
        phone: order.phone,
        city: order.city,
        delivery_method: order.delivery_method,
        address: order.address || null,
        pickup_datetime: order.pickup_datetime || null,
        payment_method: order.payment_method,
        note: order.note || null,
        items: order.items,
        total_price: order.total_price,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('preorders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('preorders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<OrderInput & { status: string }>) {
    const { data, error } = await supabase
      .from('preorders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
