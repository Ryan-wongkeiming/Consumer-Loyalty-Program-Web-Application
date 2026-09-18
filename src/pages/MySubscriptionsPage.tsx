import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Pause, Play, Trash2, Clock, CalendarDays, Package, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMySubscriptions, updateSubscriptionStatus, skipNextDelivery,
  changeSubscriptionFrequency, Subscription,
} from '../lib/subscriptions';
import { formatPrice, getSubscriptionRate } from '../data/pricing';
import ProductImage from '../components/ProductImage';

const FREQUENCY_LABELS: Record<number, string> = {
  4: 'Giao hàng mỗi 4 tuần',
  8: 'Giao hàng mỗi 8 tuần',
  12: 'Giao hàng mỗi 12 tuần',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Hoạt động',
  paused: 'Tạm dừng',
  cancelled: 'Đã hủy',
};

const MySubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getMySubscriptions();
    setSubscriptions(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePause = async (id: string) => {
    const ok = await updateSubscriptionStatus(id, 'paused');
    showMessage(ok ? 'Đã tạm dừng đăng ký' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleResume = async (id: string) => {
    const ok = await updateSubscriptionStatus(id, 'active');
    showMessage(ok ? 'Đã kích hoạt lại đăng ký' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Hủy đăng ký này? Bạn sẽ mất ưu đãi giảm giá và miễn phí vận chuyển của đăng ký.')) return;
    const ok = await updateSubscriptionStatus(id, 'cancelled');
    showMessage(ok ? 'Đăng ký hủy' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleSkip = async (id: string) => {
    const ok = await skipNextDelivery(id);
    showMessage(ok ? 'Đã bỏ qua lần giao hàng này' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleFrequencyChange = async (id: string, weeks: number) => {
    const ok = await changeSubscriptionFrequency(id, weeks);
    showMessage(ok ? 'Đã cập nhật tần suất' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem đăng ký của bạn</p>
          <Link to="/" className="bg-carehub-teal text-white px-6 py-3 rounded-lg hover:bg-carehub-teal-dark transition-colors">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/profile" className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại tài khoản
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-carehub-teal to-carehub-teal-dark text-white py-14">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Đăng ký &amp; Tiết kiệm</h1>
          <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto">
            Quản lý đăng ký của bạn — thay đổi chu kỳ, tạm dừng, bỏ qua hoặc hủy bất cứ lúc nào
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mt-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'} rounded-lg py-3`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carehub-teal mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tải đăng ký...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <div className="w-20 h-20 bg-carehub-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-carehub-teal" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có đăng ký nào</h2>
            <p className="text-gray-600 mb-6">
              Đăng ký để nhận ưu đãi 15% và miễn phí vận chuyển cho mỗi lần giao hàng định kỳ.
            </p>
            <Link to="/" className="bg-carehub-teal text-white px-6 py-3 rounded-lg hover:bg-carehub-teal-dark transition-colors">
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-carehub-teal" />
                    <span className="font-semibold text-gray-900">{FREQUENCY_LABELS[sub.frequency_weeks] || `${sub.frequency_weeks} tuần`}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      sub.status === 'active' ? 'bg-green-100 text-green-800' :
                      sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[sub.status] || sub.status}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Lần giao hàng tiếp theo: {formatDate(sub.next_delivery_date)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  {sub.subscription_items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        {item.products?.image && (
                          <ProductImage src={item.products.image} alt={item.products?.name || ''} className="w-12 h-12 object-cover rounded-lg" fallbackClassName="bg-gray-100" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.products?.name || 'Sản phẩm'}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatPrice(item.products?.price || 0)} {item.bundle_tier ? ` · ${item.bundle_tier.label}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-carehub-teal">
                        {formatPrice((item.products?.price || 0) * item.quantity * (item.is_subscription ? (1 - getSubscriptionRate(item.products)) : 1))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Manage actions */}
                <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-t">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs sm:text-sm text-gray-600">Chu kỳ:</label>
                    <select
                      value={sub.frequency_weeks}
                      onChange={(e) => handleFrequencyChange(sub.id, Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-carehub-teal"
                    >
                      <option value={4}>4 tuần</option>
                      <option value={8}>8 tuần</option>
                      <option value={12}>12 tuần</option>
                    </select>
                  </div>

                  {sub.status === 'active' ? (
                    <>
                      <button onClick={() => handleSkip(sub.id)} className="text-xs sm:text-sm text-carehub-teal hover:underline">
                        <CalendarDays className="w-4 h-4 inline-block mr-1" /> Bỏ qua lần này
                      </button>
                      <button onClick={() => handlePause(sub.id)} className="text-xs sm:text-sm text-yellow-600 hover:underline">
                        <Pause className="w-4 h-4 inline-block mr-1" /> Tạm dừng
                      </button>
                    </>
                  ) : sub.status === 'paused' ? (
                    <button onClick={() => handleResume(sub.id)} className="text-xs sm:text-sm text-green-600 hover:underline">
                      <Play className="w-4 h-4 inline-block mr-1" /> Kích hoạt lại
                    </button>
                  ) : null}

                  {sub.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(sub.id)} className="text-xs sm:text-sm text-red-600 hover:underline">
                      <Trash2 className="w-4 h-4 inline-block mr-1" /> Hủy đăng ký
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-green-50 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-carehub-teal flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900">Xác nhận hoạt động như thế nào</p>
                  <p>
                    Trước mỗi lần giao hàng, CareHub sẽ liên hệ với bạn (Zalo/WhatsApp/SMS/email) để xác nhận.
                    Nếu không có xác nhận, lần giao hàng sẽ được bỏ qua — chúng tôi không bao giờ tự động trừ tiền.
                    Bạn có thể thay đổi hoặc hủy bất cứ lúc nào, không bị phạt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubscriptionsPage;