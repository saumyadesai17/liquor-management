'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, TooltipProps 
} from 'recharts';

interface Order {
  id: number;
  total_amount: number;
  payment_method: string;
}

interface InventoryItem {
  name: string;
  quantity: number;
}

interface SalesData {
  total: number;
  orderCount: number;
  topSellingItems: { name: string; quantity: number }[];
  salesByPaymentMethod: { method: string; amount: number }[];
  lowStockItems: { name: string; quantity: number }[];
}

interface OrderItemWithInventory {
  inventory_id: number;
  quantity: number;
  inventory: {
    name: string;
  } | null;
}

// Custom colors for charts that work well in dark mode
const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

// Custom formatter for currency values
const formatCurrency = (value: number) => `₹${value.toFixed(2)}`;

// Type for the label props in Recharts
interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  name?: string;
  percent?: number;
}

export default function Dashboard() {
  const [salesData, setSalesData] = useState<SalesData>({
    total: 0,
    orderCount: 0,
    topSellingItems: [],
    salesByPaymentMethod: [],
    lowStockItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total_amount, payment_method');
      
      if (error) throw new Error('Failed to fetch orders: ' + error.message);
      return data as Order[];
    }

    async function fetchTopSellingItems() {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          inventory_id,
          quantity,
          inventory:inventory_id (name)
        `);
      
      if (error) throw new Error('Failed to fetch top selling items: ' + error.message);
      
      // First aggregate all items by their inventory_id
      const itemQuantities = (data as unknown as OrderItemWithInventory[] || []).reduce((acc: Record<string, { name: string; quantity: number }>, item) => {
        const name = item.inventory?.name || `Item #${item.inventory_id}`;
        if (!acc[item.inventory_id]) {
          acc[item.inventory_id] = { name, quantity: 0 };
        }
        acc[item.inventory_id].quantity += item.quantity;
        return acc;
      }, {});

      // Convert to array and get top 5
      return Object.values(itemQuantities)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    }

    async function fetchLowStockItems() {
      const { data, error } = await supabase
        .from('inventory')
        .select('name, quantity')
        .lt('quantity', 5)
        .order('quantity');
      
      if (error) throw new Error('Failed to fetch low stock items: ' + error.message);
      return data as InventoryItem[];
    }

    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data concurrently
        const [orders, topItems, lowStock] = await Promise.all([
          fetchOrders(),
          fetchTopSellingItems(),
          fetchLowStockItems()
        ]);

        // Process orders data
        const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
        const orderCount = orders.length;

        // Process payment methods - normalize method names to prevent duplicates
        const paymentMethodsMap = orders.reduce((acc: Record<string, number>, order) => {
          // Normalize payment method name (trim, lowercase, then capitalize first letter)
          const methodRaw = order.payment_method || 'unknown';
          const method = methodRaw.trim().toLowerCase().replace(/^\w/, c => c.toUpperCase());
          
          acc[method] = (acc[method] || 0) + order.total_amount;
          return acc;
        }, {});

        const salesByPaymentMethod = Object.entries(paymentMethodsMap).map(([method, amount]) => ({
          method,
          amount
        }));

        setSalesData({
          total: totalSales,
          orderCount,
          topSellingItems: topItems,
          salesByPaymentMethod,
          lowStockItems: lowStock.map(item => ({
            name: item.name,
            quantity: item.quantity
          }))
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Custom tooltip for the top selling items chart
  const CustomItemsTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary p-3 border border-border rounded shadow-md">
          <p className="font-medium text-foreground">{`${payload[0].payload.name}`}</p>
          <p className="text-accent">{`Units Sold: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the bar chart
  const CustomBarTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-secondary p-3 border border-border rounded shadow-md">
          <p className="font-medium text-foreground">{`${label}`}</p>
          <p className="text-accent">{`Sales: ${formatCurrency(payload[0].value as number)}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-lg text-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-lg text-red-400">Error: {error}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground">Holi Party Liquor Sales Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border hover:border-accent/50 transition-colors duration-200">
          <h2 className="text-sm sm:text-lg text-muted-foreground">Total Sales</h2>
          <p className="text-xl sm:text-3xl font-bold text-accent">₹{salesData.total.toFixed(2)}</p>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border hover:border-accent/50 transition-colors duration-200">
          <h2 className="text-sm sm:text-lg text-muted-foreground">Orders Processed</h2>
          <p className="text-xl sm:text-3xl font-bold text-accent">{salesData.orderCount}</p>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border hover:border-accent/50 transition-colors duration-200">
          <h2 className="text-sm sm:text-lg text-muted-foreground">Avg. Order Value</h2>
          <p className="text-xl sm:text-3xl font-bold text-accent">
            ₹{salesData.orderCount ? (salesData.total / salesData.orderCount).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
          <h2 className="text-lg font-medium mb-4 text-foreground">Top Selling Items</h2>
          <div className="h-60 sm:h-72">
            {salesData.topSellingItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={salesData.topSellingItems}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fill: 'var(--foreground)' }}
                    domain={[0, 'dataMax + 5']}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    tick={{ fill: 'var(--foreground)' }}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip content={<CustomItemsTooltip />} />
                  <Bar 
                    dataKey="quantity" 
                    name="Units Sold"
                    label={(props: LabelProps) => {
                      const { x, y, width, value } = props;
                      return (
                        <text 
                          x={(x || 0) + (width || 0) - 5} 
                          y={(y || 0) + 15} 
                          fill="var(--foreground)" 
                          textAnchor="end"
                          fontSize={12}
                        >
                          {value}
                        </text>
                      );
                    }}
                  >
                    {salesData.topSellingItems.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No sales data available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
          <h2 className="text-lg font-medium mb-4 text-foreground">Sales by Payment Method</h2>
          <div className="h-60 sm:h-72">
            {salesData.salesByPaymentMethod.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData.salesByPaymentMethod}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="method" 
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${value}`}
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend 
                    formatter={(value) => <span className="text-foreground">{value}</span>}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Sales Amount" 
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No payment data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
        <h2 className="text-lg font-medium mb-4 text-foreground">Low Stock Items</h2>
        
        {salesData.lowStockItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Quantity Left
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {salesData.lowStockItems.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/20 transition-colors duration-150">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {item.name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.quantity === 0 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {item.quantity === 0 ? 'Out of stock' : 'Low stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No low stock items
          </div>
        )}
      </div>
    </div>
  );
}