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

export class OrderService {
  static async create(order: OrderInput) {
    // 1. Validate stock for each item and update product stock
    for (const item of order.items) {
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('name, quantity')
        .eq('id', item.product_id)
        .single();

      if (fetchErr || !product) {
        throw new Error(`Sản phẩm ${item.name} không tồn tại.`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(`Sản phẩm ${item.name} chỉ còn ${product.quantity} sản phẩm trong kho.`);
      }

      // Decrement stock
      const newQty = product.quantity - item.quantity;
      const { error: updateErr } = await supabase
        .from('products')
        .update({ quantity: newQty })
        .eq('id', item.product_id);

      if (updateErr) {
        throw new Error(`Lỗi cập nhật kho hàng cho ${item.name}: ${updateErr.message}`);
      }
    }

    // 2. Insert order
    const { data, error } = await supabase
      .from('orders')
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
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, updates: Partial<OrderInput & { status: string }>) {
    // If order is cancelled, we should restore stock
    if (updates.status === 'CANCELLED') {
      try {
        const order = await this.getById(id);
        if (order && order.status !== 'CANCELLED') {
          for (const item of order.items) {
            const { data: product } = await supabase
              .from('products')
              .select('quantity')
              .eq('id', item.product_id)
              .single();

            if (product) {
              await supabase
                .from('products')
                .update({ quantity: product.quantity + item.quantity })
                .eq('id', item.product_id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore inventory for cancelled order:', err);
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
