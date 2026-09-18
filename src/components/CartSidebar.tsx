import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Info, ChevronDown, Check, AlertCircle, Trash2, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validatePromoCode } from '../data/promoCodes';
import { getCartSubtotal, getCartSavings, getUnitPrice, formatPrice, FREQUENCIES } from '../data/pricing';
import CameraCapture from './CameraCapture';
import ProductImage from './ProductImage';

const CartSidebar: React.FC = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);

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

  const subscriptionDiscount = 0; // Subtotal already reflects subscription pricing
  const subtotal = calculateSubtotal();
  const cartSavings = getCartSavings(state.items);
  const shippingCost = 0; // Set to 0 VND, can be adjusted later if needed
  const promoCodeDiscount = state.promoDiscount; // Renamed for clarity
  const total = Math.max(0, subtotal + shippingCost - promoCodeDiscount);
  const totalSavings = cartSavings + promoCodeDiscount; // Renamed for clarity

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
      setPromoError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setPromoSuccess('');
    }
  };

  const handleRemovePromoCode = () => {
    dispatch({ type: 'REMOVE_PROMO_CODE' });
    setPromoSuccess('');
    setPromoError('');
  };

  const handleCheckout = () => {
    dispatch({ type: 'TOGGLE_CART' });
    navigate('/checkout');
  };

  const handleCameraCapture = (code: string) => {
    setPromoCode(code);
    setPromoError('');
    setPromoSuccess('');
    setShowCamera(false);
    // Auto-apply the captured code
    setTimeout(() => handleApplyPromoCode(), 100);
  };

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => dispatch({ type: 'TOGGLE_CART' })} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="bg-carehub-teal px-4 sm:px-6 py-4 sm:py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-semibold text-sm sm:text-base">
                  {state.items.length} sản phẩm trong giỏ hàng
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-2 hover:bg-carehub-teal-dark rounded min-h-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Subscription Banner */}
          {state.items.some(item => item.product.isSubscription) && (
            <div className="bg-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-carehub-blue flex-shrink-0" />
                <span className="text-xs sm:text-sm text-carehub-blue font-medium">
                  Sản phẩm này đăng ký — ưu đãi giảm giá + miễn phí vận chuyển!
                </span>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">Giỏ hàng của bạn đang trống</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {state.items.map((item) => (
                  <div key={item.product.id} className="bg-white border rounded-lg p-3 sm:p-4 shadow-sm">
                    <div className="flex space-x-4">
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                        fallbackClassName="bg-gray-100"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-carehub-text-dark text-sm sm:text-base pr-2 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => dispatch({
                              type: 'REMOVE_ITEM',
                              payload: item.product.id
                            })}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50 min-h-[36px] flex items-center justify-center"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { id: item.product.id, quantity: Math.max(1, item.quantity - 1) }
                              })}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="text-sm sm:text-base font-medium px-2 min-w-[32px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { id: item.product.id, quantity: item.quantity + 1 }
                              })}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          <span className="font-semibold text-carehub-teal text-sm sm:text-base lg:text-lg">
                            {formatPrice(
                              getUnitPrice(item.product, {
                                quantity: item.quantity,
                                isSubscription: item.isSubscription,
                                deliveryFrequency: item.deliveryFrequency,
                              }) * item.quantity
                            )}
                          </span>
                        </div>
                        
                        {item.product.isSubscription && (
                          <div className="mt-2">
                            <div className="relative">
                              <select
                                value={item.deliveryFrequency}
                                onChange={(e) => dispatch({
                                  type: 'UPDATE_SUBSCRIPTION',
                                  payload: { 
                                    id: item.product.id, 
                                    isSubscription: item.isSubscription,
                                    deliveryFrequency: e.target.value 
                                  }
                                })}
                                className="w-full border border-gray-300 rounded px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-carehub-teal appearance-none pr-8"
                              >
                                {FREQUENCIES.map(freq => (
                                  <option key={freq.label} value={freq.label}>
                                    {freq.label}{freq.badge ? ` (${freq.badge})` : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {state.items.length > 0 && (
            <div className="border-t bg-carehub-gray-light px-4 sm:px-6 py-4 sm:py-5 space-y-4">
              {/* Savings (bundle + subscription) vs standard prices */}
              {cartSavings > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm sm:text-base">Giảm giá</h3>
                  <div className="flex justify-between text-sm sm:text-base text-green-600">
                    <span>Mua nhiều + Đăng ký</span>
                    <span>-{formatPrice(cartSavings)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-sm sm:text-base">
                    <span>Tổng giảm giá</span>
                    <span>-{formatPrice(cartSavings)}</span>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="space-y-2">
                {!state.appliedPromoCode ? (
                  <>
                    <div className="flex space-x-2 sm:space-x-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          setPromoError('');
                          setPromoSuccess('');
                        }}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 border border-gray-300 rounded px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-carehub-teal"
                      />
                      <button
                        onClick={() => setShowCamera(true)}
                        className="p-2.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors min-h-[44px] flex items-center justify-center"
                        title="Chụp mã giảm giá"
                        aria-label="Chụp mã giảm giá bằng camera"
                      >
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={handleApplyPromoCode}
                        className="bg-carehub-teal text-white px-4 py-2.5 rounded font-medium text-sm sm:text-base hover:bg-carehub-teal-dark transition-colors min-h-[44px] flex items-center justify-center"
                      >
                        Áp dụng
                      </button>
                    </div>
                    {promoError && (
                      <div className="flex items-start space-x-2 text-red-600 text-xs sm:text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{promoError}</span>
                      </div>
                    )}
                    {promoSuccess && (
                      <div className="flex items-start space-x-2 text-green-600 text-xs sm:text-sm">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{promoSuccess}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-sm sm:text-base font-medium text-green-800">
                          Mã: {state.appliedPromoCode}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-red-600 hover:text-red-800 text-sm sm:text-base font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 mt-1">
                      Giảm {state.promoDiscount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>

              {/* Savings */}
              {totalSavings > 0 && (
                <div className="text-center py-2 sm:py-3">
                  {cartSavings > 0 && ( // Show bundle+subscription savings only if applicable
                    <div className="text-carehub-blue font-semibold text-sm sm:text-base">
                      Tiết kiệm (mua nhiều + đăng ký): {formatPrice(cartSavings)}
                    </div>
                  )}
                  {promoCodeDiscount > 0 && ( // Show promo discount only if applicable
                    <div className="text-green-600 font-semibold text-sm sm:text-base">
                      Giảm giá khuyến mãi: {formatPrice(promoCodeDiscount)}
                    </div>
                  )}
                  <div className="text-carehub-blue font-bold mt-1 text-sm sm:text-base">
                    Tổng tiết kiệm: {formatPrice(totalSavings)}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="text-center py-3 border-t">
                <span className="text-lg sm:text-xl font-bold">
                  Tổng cộng {formatPrice(total)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                  className="w-full border-2 border-carehub-teal text-carehub-teal py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base hover:bg-carehub-teal hover:text-white transition-colors min-h-[48px]"
                >
                  Tiếp tục mua sắm
                </button>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-carehub-teal text-white py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base hover:bg-carehub-teal-dark transition-colors min-h-[48px]"
                >
                  Thanh toán
                </button>
              </div>

              {/* Free Shipping Notice */}
              <div className="text-center text-xs sm:text-sm text-carehub-text-medium">
                <p>Miễn phí vận chuyển!</p>
                <p className="hidden sm:block"><a href="#" className="text-carehub-teal underline">Xem chính sách mua hàng tại đây.</a></p>
              </div>
              
              {/* Free Sample CTA in Cart */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-xl">🎁</span>
                  <span className="font-bold text-sm">Dùng thử cho bé!</span>
                </div>
                <p className="text-xs text-orange-100 mb-3">2 gói miễn phí</p>
                <Link
                  to="/free-sample"
                  onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                  className="block w-full bg-white text-orange-600 py-2 rounded-lg font-bold text-sm hover:bg-orange-50 transition-colors"
                >
                  ĐĂNG KÝ NGAY!
                </Link>
              </div>
            </div>
          )}
        </div>
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
};

export default CartSidebar;