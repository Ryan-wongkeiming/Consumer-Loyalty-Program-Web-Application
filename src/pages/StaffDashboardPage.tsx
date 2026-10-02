import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Gift, AlertCircle, Calendar, CheckCircle, Clock, Eye, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatPrice } from '../data/pricing';

// ---------- Types ----------
interface StaffOrder {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  ward: string;
  total_amount: number;
  promo_code_applied: string | null;
  created_at: string;
  status: string | null;
}

interface SampleRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  baby_name: string | null;
  baby_birth_date: string | null;
  address: string;
  city: string;
  ward: string;
  notes: string | null;
  sample_type_id: string;
  created_at: string;
}

interface RedemptionRecord {
  id: string;
  redemption_type: string;
  user_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface DueSubscription {
  id: string;
  next_delivery_date: string;
  frequency_weeks: number;
  status: string;
  subscriptions_items_count: number;
}

type TabKey = 'orders' | 'samples' | 'redemptions' | 'subscriptions';

const StaffDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('orders');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [dueSubscriptions, setDueSubscriptions] = useState<DueSubscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchOrders(),
          fetchSampleRequests(),
          fetchRedemptions(),
          fetchDueSubscriptions(),
        ]);
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading staff dashboard:', err);
          setError('Không thể tải dữ liệu bảng điều khiển.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) setOrders(data as StaffOrder[]);
  };

  const fetchSampleRequests = async () => {
    const { data, error } = await supabase
      .from('free_sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) setSampleRequests(data as SampleRequest[]);
  };

  const fetchRedemptions = async () => {
    const { data, error } = await supabase
      .from('loyalty_redemptions')
      .select('*')
      .order('redeemed_at', { ascending: false })
      .limit(50);
    if (!error && data) setRedemptions(data as RedemptionRecord[]);
  };

  const fetchDueSubscriptions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`*, subscription_items(count)`)
      .gte('next_delivery_date', today)
      .lte('next_delivery_date', thirtyDaysFromNow)
      .eq('status', 'active')
      .order('next_delivery_date', { ascending: true });
    if (!error && data) setDueSubscriptions(data as unknown as DueSubscription[]);
  };

  // ---------- Tabs ----------
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'orders', label: 'Đơn hàng mới', icon: <Package className="w-4 h-4" />, count: orders.filter(o => !o.status || o.status === 'pending').length },
    { key: 'samples', label: 'Yêu cầu mẫu', icon: <Gift className="w-4 h-4" />, count: sampleRequests.length },
    { key: 'redemptions', label: 'Đổi quà/mã', icon: <Tag className="w-4 h-4" />, count: redemptions.length },
    { key: 'subscriptions', label: 'Gần đến hạn giao', icon: <Calendar className="w-4 h-4" />, count: dueSubscriptions.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại trang chủ
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển nhân viên</h1>
          <p className="text-gray-600 mt-1">Theo dõi đơn hàng, yêu cầu mẫu, đổi quà và lịch giao hàng.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-carehub-teal text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carehub-teal mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Orders tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Đơn hàng ({orders.length})</h2>
                  <button onClick={fetchOrders} className="text-sm text-carehub-teal hover:underline">Làm mới</button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có đơn hàng</h3>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.slice(0, 20).map(order => (
                      <div key={order.id} className="p-4 sm:p-6 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">{order.full_name}</span>
                              {!order.status && order.status !== 'confirmed' && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />Chờ xác nhận
                                </span>
                              )}
                              {order.status === 'confirmed' && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{order.phone}</p>
                            <p className="text-sm text-gray-600">{order.address}, {order.ward}, {order.city}</p>
                            {order.promo_code_applied && (
                              <p className="text-sm text-green-600 mt-1">Mã giảm giá: {order.promo_code_applied}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-carehub-teal">{formatPrice(order.total_amount)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sample requests tab */}
            {activeTab === 'samples' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Yêu cầu mẫu miễn phí ({sampleRequests.length})</h2>
                  <button onClick={fetchSampleRequests} className="text-sm text-carehub-teal hover:underline">Làm mới</button>
                </div>
                {sampleRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu</h3>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sampleRequests.slice(0, 20).map(req => (
                      <div key={req.id} className="p-4 sm:p-6 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{req.full_name}</p>
                            <p className="text-sm text-gray-600">{req.phone}</p>
                            {req.email && <p className="text-sm text-gray-600">{req.email}</p>}
                            {req.baby_name && <p className="text-sm text-gray-600">Tên bé: {req.baby_name}</p>}
                            {req.baby_birth_date && <p className="text-sm text-gray-600">Ngày sinh bé: {req.baby_birth_date}</p>}
                            <p className="text-sm text-gray-600">{req.address}, {req.ward}, {req.city}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Redemptions tab */}
            {activeTab === 'redemptions' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Lịch sử đổi quà/mã ({redemptions.length})</h2>
                  <button onClick={fetchRedemptions} className="text-sm text-carehub-teal hover:underline">Làm mới</button>
                </div>
                {redemptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có giao dịch đổi</h3>
                  </div>
                ) : (
                  <div className="divide-y">
                    {redemptions.slice(0, 20).map(red => (
                      <div key={red.id} className="p-4 sm:p-6 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">Loại: {red.redemption_type}</p>
                            <p className="text-sm text-gray-600">User: {red.user_id}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-500">{new Date(red.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Due subscriptions tab */}
            {activeTab === 'subscriptions' && (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Sắp đến hạn giao ({dueSubscriptions.length})</h2>
                  <button onClick={fetchDueSubscriptions} className="text-sm text-carehub-teal hover:underline">Làm mới</button>
                </div>
                {dueSubscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có Subscription nào sắp đến hạn</h3>
                    <p className="text-gray-600">Tất cả các subscription đều trong trạng thái bình thường.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {dueSubscriptions.map(sub => (
                      <div key={sub.id} className="p-4 sm:p-6 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-gray-900">Subscription #{sub.id.slice(0, 8)}</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Mỗi {sub.frequency_weeks} tuần
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Ngày giao dự kiến: {sub.next_delivery_date}</p>
                            <p className="text-sm text-gray-600">Trạng thái: {sub.status}</p>
                            <p className="text-sm text-gray-600">Số sản phẩm: {sub.subscription_items_count ?? 0}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Eye className="w-5 h-5 text-carehub-teal cursor-pointer" title="Xem chi tiết" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffDashboardPage;
