import { supabase } from '../config/supabase.js';

export class ReportService {
  static async getRevenueByYear(year: number) {
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;

    // Fetch all non-cancelled orders for this year
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_price, created_at')
      .neq('status', 'CANCELLED')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Fetch all non-cancelled preorders for this year
    const { data: preorders, error: preorderError } = await supabase
      .from('preorders')
      .select('total_price, created_at')
      .neq('status', 'CANCELLED')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (preorderError) throw preorderError;

    // Initialize 12 months array with 0 revenue
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      preorderRevenue: 0,
      orderCount: 0
    }));

    if (orders) {
      for (const order of orders) {
        const orderDate = new Date(order.created_at);
        const monthIndex = orderDate.getUTCMonth(); // 0 - 11
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRevenue[monthIndex].revenue += Number(order.total_price);
          monthlyRevenue[monthIndex].orderCount += 1;
        }
      }
    }

    if (preorders) {
      for (const order of preorders) {
        const orderDate = new Date(order.created_at);
        const monthIndex = orderDate.getUTCMonth(); // 0 - 11
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRevenue[monthIndex].preorderRevenue += Number(order.total_price);
          monthlyRevenue[monthIndex].revenue += Number(order.total_price);
          monthlyRevenue[monthIndex].orderCount += 1;
        }
      }
    }

    return {
      year,
      monthlyRevenue,
      totalYearRevenue: monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0)
    };
  }

  static async getMonthlyDetail(year: number, month: number) {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startDate = `${year}-${monthStr}-01T00:00:00.000Z`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${lastDay < 10 ? '0' + lastDay : lastDay}T23:59:59.999Z`;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('items, created_at')
      .neq('status', 'CANCELLED')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const { data: preorders, error: preorderError } = await supabase
      .from('preorders')
      .select('total_price, created_at')
      .neq('status', 'CANCELLED')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (preorderError) throw preorderError;

    const productRevenueMap: Record<string, { product_id: string; name: string; revenue: number; quantity: number }> = {};
    let totalPreorderRevenue = 0;

    if (preorders) {
      for (const order of preorders) {
        const orderDate = new Date(order.created_at);
        const orderMonth = orderDate.getUTCMonth() + 1;
        if (orderMonth !== month) continue;
        totalPreorderRevenue += Number(order.total_price);
      }
    }

    if (orders) {
      for (const order of orders) {
        const orderDate = new Date(order.created_at);
        const orderMonth = orderDate.getUTCMonth() + 1;
        if (orderMonth !== month) continue;

        const items = order.items as any[] || [];
        for (const item of items) {
          const prodId = item.product_id || 'unknown';
          const name = item.name || 'Sản phẩm không tên';
          const price = Number(item.price) || 0;
          const qty = Number(item.quantity) || 0;
          const rev = price * qty;

          if (!productRevenueMap[prodId]) {
            productRevenueMap[prodId] = {
              product_id: prodId,
              name,
              revenue: 0,
              quantity: 0
            };
          }
          productRevenueMap[prodId].revenue += rev;
          productRevenueMap[prodId].quantity += qty;
        }
      }
    }

    const productRevenueList = Object.values(productRevenueMap).sort((a, b) => b.revenue - a.revenue);

    return {
      year,
      month,
      products: productRevenueList,
      totalPreorderRevenue
    };
  }
}
