import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Gift, MapPin, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLoyaltyGifts, getUserAddresses, redeemLoyaltyGift } from '../lib/auth';
import { getAllProvinces, getWardsByProvince, Province, Ward } from '../utils/locationData';
import SearchableSelect from '../components/SearchableSelect';

interface LoyaltyGift {
  id: string;
  name: string;
  description: string;
  points_required: number;
  image_url: string;
  stock: number;
  is_active: boolean;
}

interface UserAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  ward: string;
  is_default: boolean;
}

const ThankYouScreen: React.FC<{ giftName: string }> = ({ giftName }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/loyalty');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Đổi quà thành công! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Bạn đã đổi thành công "{giftName}". Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận và giao quà.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Thời gian giao hàng:</strong> 3-5 ngày làm việc
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-blackmores-teal">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blackmores-teal"></div>
          <span className="text-sm">Đang chuyển về trang tích điểm...</span>
        </div>
      </div>
    </div>
  );
};

const RedeemConfirmationPage: React.FC = () => {
  const { giftId } = useParams<{ giftId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [gift, setGift] = useState<LoyaltyGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    ward: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/loyalty');
      return;
    }

    loadGiftDetails();
    loadUserData();
    setProvinces(getAllProvinces());
  }, [giftId, user, navigate]);

  useEffect(() => {
    if (formData.city) {
      setWards(getWardsByProvince(formData.city));
      setFormData(prev => ({ ...prev, ward: '' }));
    } else {
      setWards([]);
    }
  }, [formData.city]);

  const loadGiftDetails = async () => {
    try {
      const gifts = await getLoyaltyGifts();
      const selectedGift = gifts.find(g => g.id === giftId);
      setGift(selectedGift || null);
    } catch (error) {
      console.error('Error loading gift details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      // Pre-fill form with user profile data
      setFormData(prev => ({
        ...prev,
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        email: user?.email || ''
      }));

      // Try to get user's default address
      const addresses = await getUserAddresses();
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      
      if (defaultAddress) {
        setFormData(prev => ({
          ...prev,
          address: defaultAddress.address,
          city: defaultAddress.city,
          ward: defaultAddress.ward
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn Phường/Xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmRedemption = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await redeemLoyaltyGift(giftId!, formData);
      
      if (result.success) {
        setShowThankYou(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Có lỗi xảy ra khi đổi quà' });
      }
    } catch (error) {
      console.error('Error redeeming gift:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi quà' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để đổi quà</p>
          <Link
            to="/loyalty"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
            Quay lại trang tích điểm
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Đang tải thông tin quà tặng...</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy quà tặng</h1>
          <p className="text-gray-600 mb-6">Quà tặng bạn muốn đổi không tồn tại hoặc không còn khả dụng</p>
          <Link
            to="/loyalty"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
            Quay lại trang tích điểm
          </Link>
        </div>
      </div>
    );
  }

  // Show Thank You screen if redemption is completed
  if (showThankYou) {
    return <ThankYouScreen giftName={gift.name} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/loyalty"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang tích điểm
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-yellow-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Xác nhận đổi quà
          </h1>
          <p className="text-xl text-blue-100">
            Vui lòng xác nhận thông tin giao hàng để hoàn tất việc đổi quà
          </p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
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
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gift Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Gift className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Quà tặng đã chọn</h2>
            </div>

            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {gift.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {gift.description}
                </p>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-800">
                      Số điểm cần sử dụng:
                    </span>
                    <span className="text-lg font-bold text-purple-600">
                      {gift.points_required.toLocaleString('vi-VN')} điểm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-blackmores-teal mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Thông tin giao hàng</h2>
            </div>

            <form className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="VD: 0XXXXXXXXX"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
                  placeholder="Nhập địa chỉ email"
                />
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ cụ thể *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Số nhà, tên đường"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <SearchableSelect
                      options={provinces}
                      value={formData.city}
                      onChange={(value) => handleInputChange({ target: { name: 'city', value } } as any)}
                      placeholder="Chọn tỉnh/thành phố"
                      name="city"
                      error={!!errors.city}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <SearchableSelect
                      options={wards}
                      value={formData.ward}
                      onChange={(value) => handleInputChange({ target: { name: 'ward', value } } as any)}
                      placeholder="Chọn phường/xã"
                      name="ward"
                      disabled={!formData.city}
                      error={!!errors.ward}
                    />
                    {errors.ward && (
                      <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
                    placeholder="Ghi chú cho việc giao quà (tùy chọn)"
                  />
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Thông tin giao hàng</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Quà tặng sẽ được giao trong vòng 3-5 ngày làm việc. Chúng tôi sẽ liên hệ với bạn để xác nhận trước khi giao hàng.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/loyalty')}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRedemption}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    'Xác nhận đổi quà'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemConfirmationPage;