import { supabase } from './supabaseClient';

export interface Order {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  ward: string;
  total_amount: number;
  payment_method: 'cod' | 'vietqr';
  status: string;
  tracking_number?: string;
  carrier_name?: string;
  created_at: string;
  subscription_id?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  is_subscription: boolean;
  delivery_frequency?: string;
  bundle_tier?: Record<string, unknown>;
}

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
  status_history: Array<{
    old_status: string | null;
    new_status: string;
    changed_by?: string;
    notes?: string;
    created_at: string;
  }>;
}

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// Get paginated orders with optional status filter
export async function getOrders(status?: string, page = 1, limit = 50) {
  const { data, error } = await supabase.rpc('get_orders', {
    p_status: status || null,
    p_page: page,
    p_limit: limit,
  });

  if (error) throw error;
  return (data || []) as Order[];
}

// Get single order with full details
export async function getOrderDetails(orderId: string) {
  const { data, error } = await supabase.rpc('get_order_details', {
    p_order_id: orderId,
  });

  if (error) throw error;
  return data as OrderDetail;
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  notes?: string
) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const { data, error } = await supabase.rpc('update_order_status', {
    p_order_id: orderId,
    p_new_status: newStatus,
    p_notes: notes || null,
  });

  if (error) throw error;
  return data as Order;
}

// Add tracking number and auto-mark as shipped
export async function addTrackingNumber(
  orderId: string,
  trackingNumber: string,
  carrierName?: string
) {
  const { data, error } = await supabase.rpc('add_tracking_number', {
    p_order_id: orderId,
    p_tracking_number: trackingNumber,
    p_carrier: carrierName || null,
  });

  if (error) throw error;
  return data as Order;
}

// Export orders to CSV with UTF-8 BOM
export function exportOrdersToCSV(orders: Order[], filename = 'carehub-orders.csv') {
  // UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  
  const headers = [
    'Mã đơn hàng',
    'Khách hàng',
    'Số điện thoại',
    'Email',
    'Địa chỉ',
    'Thành phố',
    'Phường/Xã',
    'Tổng tiền (₫)',
    'Phương thức thanh toán',
    'Trạng thái',
    'Nhãn vận chuyển',
    'Mã vận đơn',
    'Ngày đặt',
  ];

  const rows = orders.map(o => [
    o.id,
    o.full_name,
    o.phone,
    o.email || '',
    `${o.address}, ${o.ward}, ${o.city}`,
    o.city,
    o.ward,
    o.total_amount,
    o.payment_method === 'cod' ? 'COD' : 'VietQR',
    getStatusText(o.status),
    o.carrier_name || '',
    o.tracking_number || '',
    new Date(o.created_at).toLocaleString('vi-VN'),
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
  
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Helper: get Vietnamese status text
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đã giao hàng',
    delivered: 'Đã giao thành công',
  };
  return map[status] || status;
}
