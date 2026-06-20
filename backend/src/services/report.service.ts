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

    // Initialize 12 months array with 0 revenue
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
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

    return {
      year,
      monthlyRevenue,
      totalYearRevenue: monthlyRevenue.reduce((acc, curr) => acc + curr.revenue, 0)
    };
  }
}
