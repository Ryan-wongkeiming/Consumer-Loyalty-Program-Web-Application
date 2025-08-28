import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Info, ChevronDown, Check, AlertCircle, Trash2, Camera } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validatePromoCode } from '../data/promoCodes';
import CameraCapture from './CameraCapture';

const CartSidebar: React.FC = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [shippingCountry, setShippingCountry] = useState('Vietnam');
  const [shippingMethod, setShippingMethod] = useState('Standard');
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
    return state.items.reduce((total, item) => {
      const price = item.isSubscription ? item.product.price * 0.7 : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateSubscriptionDiscount = () => { // Renamed for clarity
    return state.items.reduce((total, item) => {
      if (item.isSubscription) {
        const discount = item.product.price * 0.3 * item.quantity;
        return total + discount;
      }
      return total;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const subscriptionDiscount = calculateSubscriptionDiscount(); // Renamed for clarity
  const shippingCost = 0; // Set to 0 VND, can be adjusted later if needed
  const promoCodeDiscount = state.promoDiscount; // Renamed for clarity
  const total = Math.max(0, subtotal + shippingCost - promoCodeDiscount);
  const totalSavings = subscriptionDiscount + promoCodeDiscount; // Renamed for clarity

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
          <div className="bg-blackmores-teal px-4 sm:px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-semibold text-sm sm:text-base">
                  {state.items.length} sản phẩm trong giỏ hàng
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-1 hover:bg-blackmores-teal-dark rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subscription Banner */}
          {state.items.some(item => item.product.isSubscription) && (
            <div className="bg-blue-50 px-4 sm:px-6 py-3 border-b">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blackmores-blue" />
                <span className="text-xs sm:text-sm text-blackmores-blue font-medium">
                  Tạo đăng ký sản phẩm để nhận giảm giá 30% cộng MIỄN PHÍ VẬN CHUYỂN!
                </span>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500">Giỏ hàng của bạn đang trống</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.product.id} className="bg-white border rounded-lg p-3 sm:p-4">
                    <div className="flex space-x-4">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-blackmores-text-dark text-xs sm:text-sm pr-2 line-clamp-2">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => dispatch({
                              type: 'REMOVE_ITEM',
                              payload: item.product.id
                            })}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { id: item.product.id, quantity: Math.max(1, item.quantity - 1) }
                              })}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                            <span className="text-xs sm:text-sm font-medium px-1">{item.quantity}</span>
                            <button
                              onClick={() => dispatch({
                                type: 'UPDATE_QUANTITY',
                                payload: { id: item.product.id, quantity: item.quantity + 1 }
                              })}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                          <span className="font-semibold text-blackmores-teal text-sm sm:text-base">
                            {formatPrice((item.isSubscription ? item.product.price * 0.7 : item.product.price) * item.quantity)}
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
                                className="w-full border border-gray-300 rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blackmores-teal appearance-none pr-6 sm:pr-8"
                              >
                                <option value="Giao hàng mỗi 8 tuần (giảm 20%)">Giao hàng mỗi 8 tuần (giảm 20%)</option>
                                <option value="Giao hàng mỗi 4 tuần (giảm 25%)">Giao hàng mỗi 4 tuần (giảm 25%)</option>
                                <option value="Giao hàng mỗi 12 tuần (giảm 15%)">Giao hàng mỗi 12 tuần (giảm 15%)</option>
                              </select>
                              <ChevronDown className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
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
            <div className="border-t bg-blackmores-gray-light px-4 sm:px-6 py-4 space-y-4">
              {/* Discount */}
              {subscriptionDiscount > 0 && ( // Only show this block if there's a subscription discount
                <div className="space-y-2">
                 <h3 className="font-medium text-xs sm:text-sm">Giảm giá</h3>
                  <div className="flex justify-between text-sm">
                   <span>Giảm 30% đăng ký</span>
                    <span>-{formatPrice(subscriptionDiscount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                   <span>Tổng giảm giá</span>
                    <span>-{formatPrice(subscriptionDiscount)}</span>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="space-y-2">
                {!state.appliedPromoCode ? (
                  <>
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
                        className="flex-1 border border-gray-300 rounded px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                      />
                      <button
                        onClick={() => setShowCamera(true)}
                        className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        title="Chụp mã giảm giá"
                        aria-label="Chụp mã giảm giá bằng camera"
                      >
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={handleApplyPromoCode}
                        className="bg-blackmores-teal text-white px-3 sm:px-4 py-2 rounded font-medium text-xs sm:text-sm hover:bg-blackmores-teal-dark transition-colors"
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
                  </>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Mã: {state.appliedPromoCode}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Giảm {state.promoDiscount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>

              {/* Savings */}
              {totalSavings > 0 && (
                <div className="text-center py-2">
                  {subscriptionDiscount > 0 && ( // Show subscription savings only if applicable
                    <div className="text-blackmores-blue font-semibold">
                      Tiết kiệm đăng ký: {formatPrice(subscriptionDiscount)}
                    </div>
                  )}
                  {promoCodeDiscount > 0 && ( // Show promo discount only if applicable
                    <div className="text-green-600 font-semibold">
                      Giảm giá khuyến mãi: {formatPrice(promoCodeDiscount)}
                    </div>
                  )}
                  <div className="text-blackmores-blue font-bold mt-1">
                    Tổng tiết kiệm: {formatPrice(totalSavings)}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="text-center py-2 border-t">
                <span className="text-base sm:text-lg font-bold">
                  Tổng cộng {formatPrice(total)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                  className="w-full border-2 border-blackmores-teal text-blackmores-teal py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-blackmores-teal hover:text-white transition-colors"
                >
                  Tiếp tục mua sắm
                </button>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-blackmores-teal text-white py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-blackmores-teal-dark transition-colors"
                >
                  Thanh toán
                </button>
              </div>

              {/* Free Shipping Notice */}
              <div className="text-center text-xs text-blackmores-text-medium">
                <p>Miễn phí vận chuyển!</p>
                <p className="hidden sm:block">Giới hạn {formatPrice(50000)} mỗi đơn hàng. <a href="#" className="text-blackmores-teal underline">Xem chính sách mua hàng tại đây.</a></p>
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