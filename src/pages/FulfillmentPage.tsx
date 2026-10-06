import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Search, Filter, Download, X, CheckCircle,
  Clock, Truck, ChevronLeft, ChevronRight, Eye, Edit3, Tag,
  AlertCircle, CreditCard, User, MapPin, Phone, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrders, getOrderDetails, updateOrderStatus, addTrackingNumber, exportOrdersToCSV } from '../lib/orders';
import type { Order, OrderDetail } from '../lib/orders';

type TabKey = 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'vietqr';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
};

const STATUS_TEXT: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đã giao hàng',
  delivered: 'Đã giao thành công',
};

// Generate tracking number
function generateTrackingNumber(carrierId: string, orderId: string): string {
  const prefix = carrierId === 'lalamove' ? 'LM' : carrierId === 'viettel' ? 'VT' : 'VN';
  const shortId = orderId.slice(-6).toUpperCase();
  return `${prefix}-${shortId}`;
}

// Format price
function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN');
}

// Status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'confirmed': return <CheckCircle className="w-4 h-4" />;
    case 'processing': return <Edit3 className="w-4 h-4" />;
    case 'shipped': return <Truck className="w-4 h-4" />;
    case 'delivered': return <CheckCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

// Orders per page
const PAGE_SIZE = 20;

const FulfillmentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [updating, setUpdating] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusMap: Record<TabKey, string | null> = {
        all: null,
        pending: 'pending',
        confirmed: 'confirmed',
        processing: 'processing',
        shipped: 'shipped',
        delivered: 'delivered',
        vietqr: null, // handled separately
      };
      
      const filterStatus = activeTab === 'vietqr' ? null : statusMap[activeTab];
      const data = await getOrders(filterStatus || undefined, currentPage, PAGE_SIZE);
      
      // If vietqr tab, filter manually
      let filtered = data;
      if (activeTab === 'vietqr') {
        filtered = data.filter(o => o.payment_method === 'vietqr');
      }
      
      setOrders(filtered);
      setTotalCount(data.length);
      setTotalPages(Math.ceil(data.length / PAGE_SIZE));
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Load order details
  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const detail = await getOrderDetails(order.id);
      setOrderDetail(detail);
      setShowDetailModal(true);
      // Reset form
      setNewStatus(detail.order.status || 'pending');
      setStatusNotes('');
      setTrackingNumber(detail.order.tracking_number || '');
      setCarrierName(detail.order.carrier_name || '');
    } catch (err: any) {
      console.error('Error loading order details:', err);
      setError(err.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(selectedOrder.id, newStatus, statusNotes);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (orderDetail) {
        setOrderDetail(prev => prev ? { ...prev, order: updated } : prev);
      }
      setStatusNotes('');
      loadOrders();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  // Add tracking number
  const handleAddTracking = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;
    setUpdating(true);
    try {
      const updated = await addTrackingNumber(selectedOrder.id, trackingNumber.trim(), carrierName || undefined);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (orderDetail) {
        setOrderDetail(prev => prev ? { ...prev, order: updated } : prev);
      }
      setTrackingNumber(updated.tracking_number || '');
      setCarrierName(updated.carrier_name || '');
      setNewStatus('shipped');
      loadOrders();
    } catch (err: any) {
      console.error('Error adding tracking:', err);
      setError(err.message || 'Không thể thêm mã vận đơn');
    } finally {
      setUpdating(false);
    }
  };

  // Export CSV
  const handleExport = () => {
    const exportData = activeTab === 'vietqr' 
      ? orders.filter(o => o.payment_method === 'vietqr')
      : orders;
    if (exportData.length === 0) return;
    exportOrdersToCSV(exportData, `carehub-orders-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Tabs config
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'shipped', label: 'Đã giao hàng' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'vietqr', label: 'Chờ VietQR' },
  ];

  // Count orders per status
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    orders.forEach(o => {
      const s = o.status || 'pending';
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/staff-dashboard" className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại bảng điều khiển
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Xử lý đơn hàng</h1>
          <p className="text-gray-600 mt-1">Theo dõi, cập nhật trạng thái và xuất đơn hàng cho đội ngũ giao nhận.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-carehub-teal focus:border-transparent"
              />
            </div>
            
            {/* Export */}
            <button
              onClick={handleExport}
              disabled={orders.length === 0}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Xuất CSV
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-carehub-teal text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {getStatusIcon(tab.key === 'vietqr' ? 'pending' : tab.key)}
              <span>{tab.label}</span>
              {counts[tab.key === 'vietqr' ? 'pending' : tab.key] !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                }`}>
                  {counts[tab.key === 'vietqr' ? 'pending' : tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carehub-teal mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        )}

        {/* Orders table */}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có đơn hàng nào</h3>
            <p className="text-gray-600">Không tìm thấy đơn hàng nào ở trạng thái này.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.full_name}</div>
                        <div className="text-sm text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-carehub-teal">{formatPrice(order.total_amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          order.payment_method === 'cod' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.payment_method === 'cod' ? 'COD' : 'VietQR'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status || 'pending']}`}>
                          {getStatusIcon(order.status || 'pending')}
                          <span className="ml-1">{STATUS_TEXT[order.status || 'pending'] || order.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="text-carehub-teal hover:text-carehub-teal-dark"
                        >
                          <Eye className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-sm font-semibold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status || 'pending']}`}>
                        {STATUS_TEXT[order.status || 'pending'] || order.status}
                      </span>
                    </div>
                    <button onClick={() => openOrderDetail(order)} className="text-carehub-teal">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>{order.full_name}</strong> — {order.phone}</p>
                    <p className="font-semibold text-carehub-teal">{formatPrice(order.total_amount)}</p>
                    <p className="text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Trang {currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && orderDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDetailModal(false)}></div>

            {/* Modal */}
            <div className="relative inline-block w-full max-w-3xl my-8 text-left bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-carehub-teal to-teal-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Chi tiết đơn hàng</h2>
                  <p className="text-teal-100 text-sm">#{orderDetail.order.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="text-white hover:text-teal-200">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[70vh]">
                <div className="p-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-carehub-teal mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Khách hàng</p>
                        <p className="font-semibold text-gray-900">{orderDetail.order.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-carehub-teal mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-semibold text-gray-900">{orderDetail.order.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-carehub-teal mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-semibold text-gray-900">{orderDetail.order.email || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-carehub-teal mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Địa chỉ</p>
                        <p className="font-semibold text-gray-900">{orderDetail.order.address}, {orderDetail.order.ward}, {orderDetail.order.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-carehub-teal" />
                    Sản phẩm ({orderDetail.items.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Sản phẩm</th>
                          <th className="pb-2">SL</th>
                          <th className="pb-2">Giá</th>
                          <th className="pb-2">Tổng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetail.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="py-2 text-sm text-gray-900">
                              {item.product_name}
                              {item.is_subscription && (
                                <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Đăng ký</span>
                              )}
                            </td>
                            <td className="py-2 text-sm text-gray-700">{item.quantity}</td>
                            <td className="py-2 text-sm text-gray-700">{formatPrice(item.price_at_purchase)}</td>
                            <td className="py-2 text-sm font-semibold text-carehub-teal">{formatPrice(item.price_at_purchase * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Status Update */}
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-carehub-teal" />
                    Cập nhật trạng thái
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Trạng thái</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-carehub-teal"
                      >
                        {Object.entries(STATUS_TEXT).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Ghi chú</label>
                      <input
                        type="text"
                        value={statusNotes}
                        onChange={(e) => setStatusNotes(e.target.value)}
                        placeholder="Lý do thay đổi trạng thái..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-carehub-teal"
                      />
                    </div>
                  </div>

                  {/* Tracking Number */}
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-carehub-teal" />
                    Mã vận đơn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Mã vận đơn</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="VD: LM-ABC123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-carehub-teal"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Nhà vận chuyển</label>
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        placeholder="VD: Lalamove"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-carehub-teal"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating}
                      className="flex-1 bg-carehub-teal text-white py-3 rounded-lg font-semibold hover:bg-carehub-teal-dark disabled:opacity-50"
                    >
                      {updating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                    </button>
                    <button
                      onClick={handleAddTracking}
                      disabled={!trackingNumber.trim() || updating}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                      Thêm mã vận đơn
                    </button>
                  </div>

                  {/* Status History */}
                  {orderDetail.status_history && orderDetail.status_history.length > 0 && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3 mt-6">Lịch sử thay đổi</h3>
                      <div className="space-y-2">
                        {orderDetail.status_history.map((entry, idx) => (
                          <div key={idx} className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3">
                            <div className="w-2 h-2 bg-carehub-teal rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {entry.old_status ? `${STATUS_TEXT[entry.old_status] || entry.old_status}` : '—'} → {STATUS_TEXT[entry.new_status] || entry.new_status}
                              </p>
                              {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
                              <p className="text-xs text-gray-400 mt-1">{formatDate(entry.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FulfillmentPage;
