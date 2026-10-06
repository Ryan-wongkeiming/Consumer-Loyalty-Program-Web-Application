import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, User, CreditCard, Truck, CheckCircle, Tag, AlertCircle, Check, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { validatePromoCode } from '../data/promoCodes';
import { getCartSubtotal, getCartSavings, getUnitPrice, getSubscriptionRate, formatPrice, STANDARD_SHIPPING_FEE } from '../data/pricing';
import { getAllProvinces, getWardsByProvince, Province, Ward } from '../utils/locationData';
import { getEnabledCarriers, getShippingFee, isFreeShipping, getCarrierById } from '../data/deliveryServices';
import SearchableSelect from '../components/SearchableSelect';
import CameraCapture from '../components/CameraCapture';
import ProductImage from '../components/ProductImage';
import AuthModal from '../components/AuthModal';
import VietQRPaymentScreen from '../components/VietQRPaymentScreen';

const ThankYouScreen: React.FC<{ carrierName?: string; estimatedDays?: string }> = ({ carrierName, estimatedDays }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cảm ơn bạn đã đặt hàng! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Đơn hàng của bạn đã được tiếp nhận thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận và giao hàng.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Nhà vận chuyển:</strong>{' '}
            {carrierName || 'Giao hàng tiêu chuẩn'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Thời gian dự kiến:</strong>{' '}
            {estimatedDays || '3-5 ngày làm việc'}
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-carehub-teal">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-carehub-teal"></div>
          <span className="text-sm">Đang chuyển về trang sản phẩm...</span>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    ward: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr'>('cod');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('lalamove');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // VietQR payment screen state
  const [vietqrData, setVietqrData] = useState<{
    orderId: string;
    amount: number;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    description: string;
    note?: string;
  } | null>(null);
  
  // Available delivery carriers (from env-configured list)
  const carriers = getEnabledCarriers();
  if (!carriers.some(c => c.id === selectedCarrier) && carriers.length > 0) {
    setSelectedCarrier(carriers[0].id);
  }

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Location data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Load provinces on component mount
  useEffect(() => {
    setProvinces(getAllProvinces());
  }, []);

  // Load wards when province changes
  useEffect(() => {
    if (formData.city) {
      setWards(getWardsByProvince(formData.city));
      setFormData(prev => ({ ...prev, ward: '' })); // Reset ward when province changes
    } else {
      setWards([]);
    }
  }, [formData.city]);

  const calculateSubtotal = () => {
    return getCartSubtotal(state.items);
  };

  const subtotal = calculateSubtotal();
  const totalSavings = getCartSavings(state.items);
  // Shipping fee based on selected carrier (free for all-subscription orders)
  const allSubscriptions = state.items.length > 0 && state.items.every(item => item.isSubscription);
  const shippingCost = isFreeShipping(subtotal, selectedCarrier, allSubscriptions)
    ? 0
    : getShippingFee(selectedCarrier, subtotal);
  const promoDiscountVND = state.promoDiscount;
  const total = Math.max(0, subtotal + shippingCost - promoDiscountVND);

  const handleApplyPromoCode = async (codeOverride?: string) => {
    if (state.appliedPromoCode) {
      setPromoError('Chỉ được áp dụng một mã giảm giá cho mỗi đơn hàng');
      setPromoSuccess('');
      return;
    }

    const codeToValidate = codeOverride ?? promoCode;
    if (!codeToValidate?.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá');
      setPromoSuccess('');
      return;
    }

    const validPromo = await validatePromoCode(codeToValidate.trim(), subtotal);

    if (validPromo) {
      dispatch({
        type: 'APPLY_PROMO_CODE',
        payload: {
          code: validPromo.code,
          discount: validPromo.discountAmount,
          discountType: validPromo.discountType,
        },
      });
      const saved = validPromo.discountAmount.toLocaleString('vi-VN');
      setPromoSuccess(`Áp dụng thành công! Giảm ${saved}đ`);
      setPromoError('');
      setPromoCode('');
    } else {
      setPromoError('Mã giảm giá không hợp lệ, đã hết hạn, hoặc đã hết lượt sử dụng.');
      setPromoSuccess('');
    }
  };

  const handleRemovePromoCode = () => {
    dispatch({ type: 'REMOVE_PROMO_CODE' });
    setPromoSuccess('');
    setPromoError('');
  };

  const handleCameraCapture = async (code: string) => {
    setPromoCode(code);
    setPromoError('');
    setPromoSuccess('');
    setShowCamera(false);
    // Auto-apply the scanned code directly (no setTimeout, no stale state)
    await handleApplyPromoCode(code);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Block checkout if cart has subscription items and user is not logged in
    const hasSubscriptionItems = state.items.some(item => item.isSubscription);
    if (hasSubscriptionItems && !user) {
      setShowAuthModal(true);
      setErrors({ general: 'Vui lòng đăng nhập để đặt hàng có sản phẩm đăng ký.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      // Build items array for place_order RPC
      const itemsPayload = state.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        is_subscription: item.isSubscription,
        delivery_frequency: item.deliveryFrequency,
        bundle_tier: item.bundleTier || null,
      }));

      // Call place_order RPC — server computes prices atomically
      const { data: orderResult, error: rpcError } = await supabase.rpc('place_order', {
        p_full_name: formData.fullName,
        p_phone: formData.phone,
        p_email: formData.email || null,
        p_address: formData.address,
        p_city: formData.city,
        p_ward: formData.ward,
        p_notes: formData.notes || null,
        p_promo_code: state.appliedPromoCode,
        p_items: itemsPayload,
        p_user_id: user?.id || null,
        p_payment_method: paymentMethod,
      });

      if (rpcError) {
        console.error('Error placing order via RPC:', rpcError);
        if (rpcError.message.includes('Promo code')) {
          setErrors({ general: rpcError.message });
        } else if (rpcError.message.includes('not found')) {
          setErrors({ general: 'Một hoặc nhiều sản phẩm không còn tồn tại. Vui lòng cập nhật giỏ hàng.' });
        } else {
          setErrors({ general: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.' });
        }
        setIsSubmitting(false);
        return;
      }

      // Order placed successfully
      setIsSubmitting(false);

      if (paymentMethod === 'vietqr' && orderResult) {
        // Generate VietQR payment URL and show payment screen
        const { data: vietqrData, error: vietqrError } = await supabase.rpc('generate_vietqr_payment_url', {
          p_order_id: orderResult.order_id,
          p_amount: orderResult.total,
        });

        if (!vietqrError && vietqrData) {
          try {
            const parsed = typeof vietqrData === 'string' ? JSON.parse(vietqrData) : vietqrData;
            setVietqrData({
              orderId: orderResult.order_id,
              amount: parsed.amount || orderResult.total,
              bankCode: parsed.bank_code || 'VBBANK',
              accountNumber: parsed.account_number || '',
              accountName: parsed.account_name || '',
              description: parsed.description || '',
              note: parsed.note,
            });
          } catch {
            console.error('Failed to parse VietQR data');
          }
        }
      } else {
        // COD — show thank you immediately
        setShowThankYou(true);
      }

    } catch (error) {
      console.error('Unexpected error during checkout:', error);
      setErrors({ general: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.' });
      setIsSubmitting(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Link
            to="/"
            className="bg-carehub-teal text-white px-6 py-3 rounded-lg hover:bg-carehub-teal-dark transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // Show VietQR payment screen if order placed with VietQR
  if (vietqrData) {
    return (
      <VietQRPaymentScreen
        orderId={vietqrData.orderId}
        amount={vietqrData.amount}
        bankCode={vietqrData.bankCode}
        accountNumber={vietqrData.accountNumber}
        accountName={vietqrData.accountName}
        description={vietqrData.description}
        note={vietqrData.note}
        onConfirm={() => {
          dispatch({ type: 'CLEAR_CART' });
          setShowThankYou(true);
        }}
      />
    );
  }

  // Show Thank You screen if order is completed
  const selectedCarrierInfo = getCarrierById(selectedCarrier);
  if (showThankYou) {
    return <ThankYouScreen carrierName={selectedCarrierInfo?.name} estimatedDays={selectedCarrierInfo?.estimatedDays} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại mua sắm
          </Link>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Shipping Information */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-carehub-teal mr-2" />
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Thông tin người nhận</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="VD: 0XXXXXXXXX"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                    Email (tùy chọn)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent"
                    placeholder="Nhập địa chỉ email"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-carehub-teal mr-2" />
                  <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      Địa chỉ cụ thể *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <SearchableSelect
                        options={provinces}
                        value={formData.city}
                        onChange={(value) => handleInputChange({ target: { name: 'city', value } })}
                        placeholder="Chọn tỉnh/thành phố"
                        error={!!errors.city}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div className="sm:col-span-1 lg:col-span-2">
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        Phường/Xã *
                      </label>
                      <SearchableSelect
                        options={wards}
                        value={formData.ward}
                        onChange={(value) => handleInputChange({ target: { name: 'ward', value } })}
                        placeholder="Chọn phường/xã"
                        disabled={!formData.city}
                        error={!!errors.ward}
                      />
                      {errors.ward && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.ward}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent resize-none"
                      placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Truck className="w-5 h-5 text-carehub-teal mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Phương thức giao hàng</h2>
                </div>

                {carriers.length > 1 ? (
                  <div className="space-y-3">
                    {carriers.map((carrier) => {
                      const fee = isFreeShipping(subtotal, carrier.id, allSubscriptions) 
                        ? 0 
                        : getShippingFee(carrier.id, subtotal);
                      const isSelected = selectedCarrier === carrier.id;
                      
                      return (
                        <button
                          key={carrier.id}
                          type="button"
                          onClick={() => setSelectedCarrier(carrier.id)}
                          className={`w-full border rounded-lg p-3 sm:p-4 flex items-start text-left transition-all ${
                            isSelected 
                              ? 'border-carehub-teal bg-green-50 ring-1 ring-carehub-teal' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <CheckCircle className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${isSelected ? 'text-carehub-teal' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm sm:text-base text-gray-900">{carrier.name}</p>
                              <span className={`font-semibold text-sm sm:text-base ${fee === 0 ? 'text-green-600' : 'text-carehub-teal'}`}>
                                {fee === 0 ? 'Miễn phí' : formatPrice(fee)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">{carrier.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Dự kiến: {carrier.estimatedDays}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Single carrier or none — show default option
                  <div className={`border rounded-lg p-3 sm:p-4 ${allSubscriptions ? 'border-green-200 bg-green-50' : 'border-carehub-teal bg-green-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className={`w-5 h-5 mr-3 ${allSubscriptions ? 'text-green-600' : 'text-carehub-teal'}`} />
                        <div>
                          <p className="font-medium text-sm sm:text-base text-gray-900">
                            {carriers.length > 0 ? carriers[0].name : 'Giao hàng tiêu chuẩn'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {carriers.length > 0 ? carriers[0].estimatedDays : 'Thời gian giao hàng: 3-5 ngày làm việc'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm sm:text-base ${allSubscriptions ? 'text-green-600' : 'text-carehub-teal'}`}>
                        {allSubscriptions ? 'Miễn phí' : formatPrice(STANDARD_SHIPPING_FEE)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary & Payment */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-5 sm:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4">
                  Đơn hàng ({state.items.length} sản phẩm)
                </h2>

                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.product.id} className="flex space-x-3">
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                        fallbackClassName="bg-gray-100"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 leading-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Số lượng: {item.quantity}
                        </p>
                        {item.isSubscription && (
                          <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
                            Đăng ký (Giảm {Math.round(getSubscriptionRate(item.product) * 100)}%)
                          </p>
                        )}
                        {item.bundleTier && (
                          <p className="text-xs sm:text-sm text-carehub-teal font-medium mt-1">
                            Mua {item.bundleTier.quantity} hộp {item.bundleTier.label}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-carehub-teal text-sm sm:text-base lg:text-lg">
                          {formatPrice(
                            getUnitPrice(item.product, {
                              quantity: item.quantity,
                              isSubscription: item.isSubscription,
                              deliveryFrequency: item.deliveryFrequency,
                            }) * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-600">
                      <span>Tiết kiệm (mua nhiều + đăng ký):</span>
                      <span>-{formatPrice(totalSavings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}</span>
                  </div>
                  {state.promoDiscount > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-green-600">
                      <span>Mã giảm giá:</span>
                      <span>-{state.promoDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base sm:text-lg lg:text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Tổng cộng:</span>
                    <span className="text-carehub-teal">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-5 h-5 text-carehub-teal mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full border rounded-lg p-3 sm:p-4 flex items-center ${
                      paymentMethod === 'cod'
                        ? 'border-carehub-teal bg-green-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 mr-3 ${paymentMethod === 'cod' ? 'text-carehub-teal' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-medium text-sm sm:text-base text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs sm:text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận được hàng</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`w-full border rounded-lg p-3 sm:p-4 flex items-center ${
                      paymentMethod === 'vietqr'
                        ? 'border-carehub-teal bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 mr-3 ${paymentMethod === 'vietqr' ? 'text-carehub-teal' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="font-medium text-sm sm:text-base text-gray-900">Thanh toán qua VietQR</p>
                      <p className="text-xs sm:text-sm text-gray-600">Quét mã QR để chuyển khoản ngân hàng</p>
                    </div>
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán cho shipper.
                  </p>
                </div>
              </div>

              {/* Promotion Code */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <Tag className="w-5 h-5 text-carehub-teal mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Mã giảm giá</h2>
                </div>

                {!state.appliedPromoCode ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError('');
                          setPromoSuccess('');
                        }}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-carehub-teal focus:border-transparent"
                      />
                      <button
                        onClick={() => setShowCamera(true)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Chụp mã giảm giá"
                        aria-label="Chụp mã giảm giá bằng camera"
                      >
                        <Camera className="w-5 h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={handleApplyPromoCode}
                        className="bg-carehub-teal text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm hover:bg-carehub-teal-dark transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                    
                    {promoError && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{promoError}</span>
                      </div>
                    )}
                    
                    {promoSuccess && (
                      <div className="flex items-center space-x-2 text-green-600 text-sm">
                        <Check className="w-4 h-4" />
                        <span>{promoSuccess}</span>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Mã: {state.appliedPromoCode}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-green-600 mt-1">
                      Giảm {state.promoDiscount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-4 flex items-start space-x-2" role="alert">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-sm sm:text-base">Lỗi!</strong>
                    <span className="block text-sm sm:text-base"> {errors.general}</span>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-carehub-teal text-white py-4 sm:py-5 rounded-lg font-semibold text-base sm:text-lg hover:bg-carehub-teal-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  'Đặt hàng'
                )}
              </button>

              {/* Policy Agreement */}
              <div className="text-center text-xs sm:text-sm text-gray-600 leading-relaxed">
                <p>
                  Bằng việc đặt hàng, bạn đồng ý với{' '}
                  <a href="#" className="text-carehub-teal hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-carehub-teal hover:underline">
                    Chính sách bảo mật
                  </a>{' '}
                  của CareHub
                </p>
              </div>
              
              {/* Free Sample Offer */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-xl">🎁</span>
                  <span className="font-bold text-sm">Lần đầu mua hàng?</span>
                </div>
                <p className="text-xs text-orange-100 mb-3">
                  Thử miễn phí 2 gói CareHub trước!
                </p>
                <Link
                  to="/free-sample"
                  className="block w-full bg-white text-orange-600 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors"
                >
                  NHẬN MẪU MIỄN PHÍ
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCodeDetected={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Auth Modal for subscription checkout */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
        />
      )}
    </div>
  );
}
