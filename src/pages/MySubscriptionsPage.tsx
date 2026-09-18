import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Pause, Play, Trash2, Clock, CalendarDays, Package, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMySubscriptions, updateSubscriptionStatus, skipNextDelivery,
  changeSubscriptionFrequency, Subscription,
} from '../lib/subscriptions';
import { formatPrice } from '../data/pricing';

const FREQUENCY_LABELS: Record<number, string> = {
  4: 'Giao hàng mỗi 4 tuần',
  8: 'Giao hàng mỗi 8 tuần',
  12: 'Giao hàng mỗi 12 tuần',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktiv',
  paused: 'Pauză',
  cancelled: 'Hủy',
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
    showMessage(ok ? 'Đăng ký pauză' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleResume = async (id: string) => {
    const ok = await updateSubscriptionStatus(id, 'active');
    showMessage(ok ? 'Đăng ký aktiv lại' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Hủy đăng ký này? Điểm thưởng và giảm giá đăng ký sẽ được thủş.')) return;
    const ok = await updateSubscriptionStatus(id, 'cancelled');
    showMessage(ok ? 'Đăng ký hủy' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleSkip = async (id: string) => {
    const ok = await skipNextDelivery(id);
    showMessage(ok ? 'Giao hàng sauă tưă skipă' : 'Lỗi, thử lại');
    if (ok) loadSubscriptions();
  };

  const handleFrequencyChange = async (id: string, weeks: number) => {
    const ok = await changeSubscriptionFrequency(id, weeks);
    showMessage(ok ? 'Chỉ cập updatedă' : 'Lỗi, thử lại');
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
            Quản đăng ký của bạn — thay đổi chu kỳ, pauză, skipă sauă hủy bất cứ lúc nào
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nici đăng ký nuă</h2>
            <p className="text-gray-600 mb-6">
              Đăng ký pentru a primi -30% și miễn phí vận chuyển la fiecare giao hàng.
            </p>
            <Link to="/" className="bg-carehub-teal text-white px-6 py-3 rounded-lg hover:bg-carehub-teal-dark transition-colors">
              Khám plá îndată
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
                      Următoarea giao hàng: {formatDate(sub.next_delivery_date)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4">
                  {sub.subscription_items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        {item.products?.image && (
                          <img src={item.products.image} alt={item.products?.name || ''} className="w-12 h-12 object-cover rounded-lg" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.products?.name || 'Sản phẩm'}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatPrice(item.products?.price || 0)} {item.bundle_tier ? ` · ${item.bundle_tier.label}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-carehub-teal">
                        {formatPrice((item.products?.price || 0) * item.quantity * (item.is_subscription ? 0.7 : 1))}
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
                        <CalendarDays className="w-4 h-4 inline-block mr-1" /> Skipă
                      </button>
                      <button onClick={() => handlePause(sub.id)} className="text-xs sm:text-sm text-yellow-600 hover:underline">
                        <Pause className="w-4 h-4 inline-block mr-1" /> Pauză
                      </button>
                    </>
                  ) : sub.status === 'paused' ? (
                    <button onClick={() => handleResume(sub.id)} className="text-xs sm:text-sm text-green-600 hover:underline">
                      <Play className="w-4 h-4 inline-block mr-1" /> Activă din nou
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
                  <p className="font-medium text-gray-900">Cum funcționează confirmarea</p>
                  <p>
                    Înaintea fiecarei giao hàng, CareHub vă va contactă (WhatsApp/SMS/email) pentru confirmare.
                    Fără confirmare, giao hàng este skipă — niciodată nu vă auto-facturăm.
                    Puteți modifica sau anula oricând, fără penaliză.
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