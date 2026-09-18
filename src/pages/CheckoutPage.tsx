import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, CreditCard, Truck, CheckCircle, Tag, AlertCircle, Check, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { validatePromoCode } from '../data/promoCodes';
import { getCartSubtotal, getCartSavings, getUnitPrice, formatPrice } from '../data/pricing';
import { getAllProvinces, getWardsByProvince, Province, Ward } from '../utils/locationData';
import SearchableSelect from '../components/SearchableSelect';
import CameraCapture from '../components/CameraCapture';

const ThankYouScreen: React.FC = () => {
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
            <strong>Thời gian giao hàng:</strong> 3-5 ngày làm việc
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
  const navigate = useNavigate();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateSubtotal = () => {
    return getCartSubtotal(state.items);
  };

  const subtotal = calculateSubtotal();
  const totalSavings = getCartSavings(state.items);
  const shippingCost = 0; // Set to 0 VND, can be adjusted later if needed
  const promoDiscountVND = state.promoDiscount;
  const total = Math.max(0, subtotal + shippingCost - promoDiscountVND);

  const handleApplyPromoCode = async () => {
    if (state.appliedPromoCode) {
      setPromoError('Chỉ được áp dụng một mã giảm giá cho mỗi đơn hàng');
      setPromoSuccess('');
      return;
    }

    if (!promoCode.trim()) {
      setPromoError('Vui lòng nhập mã giảm giá');
      setPromoSuccess('');
      return;
    }

    const validPromo = await validatePromoCode(promoCode.trim());

    if (validPromo) {
      dispatch({
        type: 'APPLY_PROMO_CODE',
        payload: {
          code: validPromo.code,
          discount: validPromo.discount,
        },
      });
      setPromoSuccess(`Áp dụng thành công! Giảm ${validPromo.discount.toLocaleString('vi-VN')}đ`);
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

  const handleCameraCapture = (code: string) => {
    setPromoCode(code);
    setPromoError('');
    setPromoSuccess('');
    setShowCamera(false);
    // Auto-apply the captured code
    setTimeout(() => handleApplyPromoCode(), 100);
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

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      // 1. Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          ward: formData.ward,
          notes: formData.notes,
          total_amount: total, // Use the calculated total
          promo_code_applied: state.appliedPromoCode, // Pass applied promo code
          user_id: user?.id || null, // Link to user if logged in
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        // Check for specific error messages from the trigger
        if (orderError.message.includes('Promo code')) {
          setErrors({ general: orderError.message });
        } else {
          setErrors({ general: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.' });
        }
        setIsSubmitting(false);
        return;
      }

      const orderId = orderData.id;

      // 2. Insert into order_items table
      const orderItemsToInsert = state.items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price_at_purchase: getUnitPrice(item.product, {
          quantity: item.quantity,
          isSubscription: item.isSubscription,
          deliveryFrequency: item.deliveryFrequency,
        }),
        is_subscription: item.isSubscription,
        delivery_frequency: item.deliveryFrequency,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        setErrors({ general: 'Đã xảy ra lỗi khi thêm sản phẩm vào đơn hàng. Vui lòng liên hệ hỗ trợ.' });
        // Potentially, you might want to delete the order if order items fail to insert
        setIsSubmitting(false);
        return;
      }

      // 3. If any item is a subscription and user is logged in,
      //    create the subscription + items (Blackmores rule: account required)
      const subscriptionItems = state.items.filter(item => item.isSubscription);
      if (subscriptionItems.length > 0 && user) {
        const freq = subscriptionItems[0].deliveryFrequency;
        const frequencyWeeks = freq.includes('4') ? 4 : freq.includes('12') ? 12 : 8;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + frequencyWeeks * 7);

        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            frequency_weeks: frequencyWeeks,
            next_delivery_date: nextDate.toISOString().split('T')[0],
            status: 'active',
          })
          .select()
          .single();

        if (!subError && subData) {
          const subItems = subscriptionItems.map(item => ({
            subscription_id: subData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            is_subscription: true,
            delivery_frequency: item.deliveryFrequency,
            bundle_tier: item.bundleTier || null,
          }));
          await supabase.from('subscription_items').insert(subItems);

          // Link the order to the subscription
          await supabase
            .from('orders')
            .update({ subscription_id: subData.id })
            .eq('id', orderId);
        }
      }

      // If everything is successful
      setShowThankYou(true);
      setIsSubmitting(false);
      
      // Auto redirect after 4 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_CART' });
        navigate('/');
      }, 4000);

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

  // Show Thank You screen if order is completed
  if (showThankYou) {
    return <ThankYouScreen />;
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

                <div className="border border-carehub-teal rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-carehub-teal mr-3" />
                      <div>
                        <p className="font-medium text-sm sm:text-base text-gray-900">Giao hàng tiêu chuẩn</p>
                        <p className="text-xs sm:text-sm text-gray-600">Thời gian giao hàng: 3-5 ngày làm việc</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-carehub-teal">Miễn phí</span>
                  </div>
                </div>
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
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
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
                            Đăng ký (Giảm 30%)
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
                    <span>Miễn phí</span>
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

                <div className="border border-carehub-teal rounded-lg p-3 sm:p-4 bg-green-50">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-carehub-teal mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base text-gray-900">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Thanh toán bằng tiền mặt khi nhận được hàng
                      </p>
                    </div>
                  </div>
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
    </div>
  );
}
