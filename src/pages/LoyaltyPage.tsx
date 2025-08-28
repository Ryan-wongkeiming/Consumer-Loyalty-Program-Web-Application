import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Camera, Star, Trophy, CheckCircle, AlertCircle, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserLoyaltyPoints, redeemLoyaltyCode, getLoyaltyGifts, redeemLoyaltyGift, getUserRedemptions } from '../lib/auth';
import CameraCapture from '../components/CameraCapture';

interface LoyaltyGift {
  id: string;
  name: string;
  description: string;
  points_required: number;
  image_url: string;
  stock: number;
  is_active: boolean;
}

interface UserRedemption {
  id: string;
  points_spent: number;
  status: string;
  redeemed_at: string;
  loyalty_gifts: {
    name: string;
    description: string;
    image_url: string;
  };
}

const LoyaltyPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loyaltyCode, setLoyaltyCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userPoints, setUserPoints] = useState({ total_points: 0, last_updated_at: null });
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [loyaltyGifts, setLoyaltyGifts] = useState<LoyaltyGift[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(true);
  const [redeemingGifts, setRedeemingGifts] = useState<Set<string>>(new Set());
  const [userRedemptions, setUserRedemptions] = useState<UserRedemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [activeTab, setActiveTab] = useState<'redeem' | 'gifts' | 'history'>('redeem');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Always load loyalty gifts to show to all users
    loadLoyaltyGifts();
    
    // Only load user-specific data if logged in
    if (user) {
      loadUserPoints();
      loadUserRedemptions();
    } else {
      // Reset user-specific data when not logged in
      setUserPoints({ total_points: 0, last_updated_at: null });
      setUserRedemptions([]);
      setLoadingPoints(false);
      setLoadingRedemptions(false);
    }
  }, [user]);

  const loadUserPoints = async () => {
    try {
      const points = await getUserLoyaltyPoints();
      setUserPoints(points);
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    } finally {
      setLoadingPoints(false);
    }
  };

  const loadLoyaltyGifts = async () => {
    try {
      const gifts = await getLoyaltyGifts();
      setLoyaltyGifts(gifts);
    } catch (error) {
      console.error('Error loading loyalty gifts:', error);
    } finally {
      setLoadingGifts(false);
    }
  };

  const loadUserRedemptions = async () => {
    try {
      const redemptions = await getUserRedemptions();
      setUserRedemptions(redemptions);
    } catch (error) {
      console.error('Error loading user redemptions:', error);
    } finally {
      setLoadingRedemptions(false);
    }
  };

  const handleRedeemGift = async (giftId: string) => {
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Navigate to redemption confirmation page
    navigate(`/loyalty/redeem/${giftId}`);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await redeemCode(loyaltyCode);
  };

  const redeemCode = async (code: string) => {
    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã thưởng' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await redeemLoyaltyCode(code.trim());
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `${result.message} Tổng điểm của bạn: ${result.totalPoints}` 
        });
        setLoyaltyCode('');
        await loadUserPoints(); // Refresh points display
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mã' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCameraCapture = (code: string) => {
    setLoyaltyCode(code);
    setShowCamera(false);
    setMessage(null);
    // Auto-redeem captured code
    setTimeout(() => redeemCode(code), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Trophy className="w-16 h-16 text-yellow-300" />
              <Sparkles className="w-6 h-6 text-yellow-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Chương Trình Tích Điểm
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Đổi mã thưởng và tích lũy điểm để nhận ưu đãi đặc biệt
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Points Display */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Coins className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user ? 'Điểm thưởng của bạn' : 'Điểm thưởng'}
            </h2>
            {loadingPoints ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            ) : user ? (
              <>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600">
                  {userPoints.total_points.toLocaleString('vi-VN')} điểm
                </div>
                {userPoints.last_updated_at && (
                  <p className="text-gray-500 text-sm mt-2">
                    Cập nhật lần cuối: {new Date(userPoints.last_updated_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-400">
                  ??? điểm
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium mb-2">Đăng nhập để xem điểm thưởng của bạn!</p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Đăng nhập ngay
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 mb-6 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'redeem', label: 'Đổi mã thưởng', icon: Gift },
                { id: 'gifts', label: 'Quà tặng', icon: Sparkles },
                { id: 'history', label: 'Lịch sử', icon: Trophy }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Code Redemption Tab */}
            {activeTab === 'redeem' && (
              <>
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        Đăng nhập để tham gia chương trình tích điểm
                      </h3>
                      <p className="text-blue-700 mb-4">
                        Tạo tài khoản miễn phí để tích lũy điểm và đổi những món quà hấp dẫn
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Đăng nhập / Đăng ký
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <Gift className="w-12 h-12 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Nhập mã thưởng</h2>
                    <p className="text-gray-600">
                      Nhập mã thưởng từ sản phẩm hoặc chụp ảnh để tự động nhận diện
                    </p>
                  </div>

                  <form onSubmit={handleCodeSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã thưởng
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={loyaltyCode}
                          onChange={(e) => {
                            setLoyaltyCode(e.target.value.toUpperCase());
                            setMessage(null);
                          }}
                          placeholder="Nhập mã thưởng (VD: BLACKMORES2025)"
                          className={`flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-mono text-lg ${
                            !user ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          maxLength={20}
                          disabled={!user}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className={`px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 ${
                            !user ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Chụp mã thưởng"
                          disabled={!user}
                        >
                          <Camera className="w-5 h-5" />
                          <span className="hidden sm:inline">Chụp</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !loyaltyCode.trim() || !user}
                      className={`w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] ${
                        !user ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang xử lý...</span>
                        </div>
                      ) : !user ? (
                        'Đăng nhập để nhập mã'
                      ) : (
                        'Nhập mã thưởng'
                      )}
                    </button>
                  </form>

                  {/* How It Works - Only show on redeem tab */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cách thức hoạt động</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">1. Tìm mã thưởng</h3>
                        <p className="text-gray-600 text-sm">
                          Mã thưởng có thể được tìm thấy sau lớp phủ cào trên tem dán. Khách hàng tích lũy điểm thưởng bằng cách cào nhẹ phần tráng bạc trên tem và nhập thông tin.
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">2. Nhập hoặc chụp mã</h3>
                        <p className="text-gray-600 text-sm">
                          Nhập mã thủ công hoặc sử dụng camera để tự động nhận diện mã thưởng
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center mx-auto mb-4">
                          <Coins className="w-8 h-8 text-teal-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">3. Nhận điểm thưởng</h3>
                        <p className="text-gray-600 text-sm">
                          Tích lũy điểm và sử dụng để đổi lấy các ưu đãi và quà tặng hấp dẫn
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Loyalty Gifts Tab */}
            {activeTab === 'gifts' && (
              <>
                {!user && (
                  <div className="bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Sparkles className="w-12 h-12 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-purple-900 mb-2">
                        Đăng nhập để tham gia chương trình tích điểm!
                      </h3>
                      <p className="text-purple-700 mb-4">
                        Tích lũy điểm thưởng và đổi lấy những món quà tuyệt vời bên dưới
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-teal-700 transition-colors font-medium"
                      >
                        Đăng nhập / Đăng ký ngay
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <Sparkles className="w-12 h-12 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quà tặng hấp dẫn</h2>
                    <p className="text-gray-600">
                      {user ? 'Sử dụng điểm thưởng để đổi lấy những món quà tuyệt vời' : 'Khám phá những món quà tuyệt vời đang chờ bạn'}
                    </p>
                  </div>

                  {loadingGifts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Đang tải quà tặng...</p>
                    </div>
                  ) : loyaltyGifts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Hiện tại chưa có quà tặng nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loyaltyGifts.map((gift) => (
                        <div key={gift.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden flex flex-col h-full">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={gift.image_url}
                              alt={gift.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {gift.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
                              {gift.description}
                            </p>
                            <div className="flex items-center justify-between mb-4 mt-auto">
                              <span className="text-lg font-bold text-purple-600">
                                {gift.points_required.toLocaleString('vi-VN')} điểm
                              </span>
                              <span className="text-sm text-gray-500">
                                Còn: {gift.stock}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRedeemGift(gift.id)}
                              disabled={
                                !user ||
                                redeemingGifts.has(gift.id) || 
                                (user && userPoints.total_points < gift.points_required) || 
                                gift.stock <= 0
                              }
                              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                                !user
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : user && userPoints.total_points >= gift.points_required && gift.stock > 0
                                  ? 'bg-gradient-to-r from-purple-600 to-teal-600 text-white hover:from-purple-700 hover:to-teal-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {redeemingGifts.has(gift.id) ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Đang đổi...</span>
                                </div>
                              ) : !user ? (
                                'Đăng nhập để đổi'
                              ) : userPoints.total_points < gift.points_required ? (
                                'Không đủ điểm'
                              ) : gift.stock <= 0 ? (
                                'Hết hàng'
                              ) : (
                                'Đổi quà'
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Redemption History Tab */}
            {activeTab === 'history' && (
              <>
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-4">
                        <Trophy className="w-12 h-12 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                        Tham gia chương trình tích điểm Blackmores
                      </h3>
                      <p className="text-yellow-700 mb-4">
                        Đăng nhập để theo dõi tất cả những món quà bạn đã đổi
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                      >
                        Đăng nhập để xem lịch sử
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <Trophy className="w-12 h-12 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử đổi quà</h2>
                    <p className="text-gray-600">
                      {user ? 'Xem lại các món quà bạn đã đổi' : 'Theo dõi lịch sử đổi quà của bạn'}
                    </p>
                  </div>

                  {!user ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Đăng nhập để xem lịch sử đổi quà</p>
                    </div>
                  ) : loadingRedemptions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Đang tải lịch sử...</p>
                    </div>
                  ) : userRedemptions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Bạn chưa đổi quà nào</p>
                      <p className="text-sm">Hãy tích lũy điểm và đổi những món quà hấp dẫn!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRedemptions.map((redemption) => (
                        <div key={redemption.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start space-x-4">
                            <img
                              src={redemption.loyalty_gifts.image_url}
                              alt={redemption.loyalty_gifts.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-gray-900">{redemption.loyalty_gifts.name}</h3>
                                  <p className="text-gray-600 text-sm">{redemption.loyalty_gifts.description}</p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Đổi ngày: {formatDate(redemption.redeemed_at)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-purple-600">
                                    -{redemption.points_spent.toLocaleString('vi-VN')} điểm
                                  </div>
                                  <div className={`text-sm px-2 py-1 rounded-full ${
                                    redemption.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : redemption.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {redemption.status === 'completed' ? 'Hoàn thành' : 
                                     redemption.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && user && (
        <CameraCapture
          onCodeDetected={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Auth Modal for Anonymous Users */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAuthModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Tham gia chương trình thưởng Blackmores
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 mb-4">
                        Đăng ký tài khoản miễn phí để:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2 mb-6">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span>Tích lũy điểm từ mỗi lần mua hàng</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span>Đổi mã tích điểm từ sản phẩm</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span>Đổi điểm lấy quà tặng hấp dẫn</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          <span>Nhận ưu đãi độc quyền</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => {
                    setShowAuthModal(false);
                    // Navigate to home page where auth modal can be opened
                    window.location.href = '/?auth=signup';
                  }}
                >
                  Đăng ký ngay
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => {
                    setShowAuthModal(false);
                    // Navigate to home page where auth modal can be opened
                    window.location.href = '/?auth=signin';
                  }}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setShowAuthModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPage;