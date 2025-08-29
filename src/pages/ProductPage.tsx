import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart, Heart, Truck, Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { getProducts, Product } from '../data/products';
import { useCart } from '../context/CartContext';
import MessageForm from '../components/MessageForm';
import MessageList from '../components/MessageList';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [isSubscription, setIsSubscription] = useState(product?.isSubscription || false);
  const [deliveryFrequency, setDeliveryFrequency] = useState('Giao hàng mỗi 8 tuần (giảm 20%)');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { dispatch } = useCart();
  const [messageRefreshTrigger, setMessageRefreshTrigger] = useState(0);

  // Load product data from Supabase
  React.useEffect(() => {
    const loadProduct = async () => {
      try {
        const products = await getProducts();
        const foundProduct = products.find(p => p.id === id);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-600">Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const subscriptionPrice = product.price * 0.85; // 15% discount for subscription

  // Use product images array from database, fallback to single image if not available
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image]; // Fallback to single image if images array is empty

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity,
        isSubscription,
        deliveryFrequency,
      },
    });
    dispatch({ type: 'TOGGLE_CART' });
  };

  const handleContinueShopping = () => {
    // Navigate to homepage and scroll to products section
    window.location.href = '/';
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };
  return (
    <div className="bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleContinueShopping}
              className="text-blackmores-teal hover:text-blackmores-teal-dark transition-colors"
            >
              Tất cả sản phẩm
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-blackmores-teal font-medium bg-green-50 px-2 py-1 rounded">
              {product.category}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden group w-full max-h-[60vh] sm:max-h-[70vh] lg:max-h-none">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 max-w-sm mx-auto lg:max-w-none">
              {productImages.map((image, index) => (
                <div 
                  key={index} 
                  className={`aspect-square bg-white rounded-md shadow-sm overflow-hidden border-2 cursor-pointer transition-all duration-200 min-h-[60px] sm:min-h-[80px] ${
                    selectedImageIndex === index 
                      ? 'border-blackmores-teal ring-2 ring-blackmores-teal ring-opacity-50' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
            
            {/* Image Navigation Dots */}
            <div className="flex justify-center space-x-2 pt-1">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'bg-blackmores-teal scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <div className="mb-2">
                <span className="text-sm sm:text-base text-blackmores-teal font-medium bg-green-50 px-3 py-1.5 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-xs sm:text-sm text-gray-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Subscription Toggle */}
            {product.isSubscription && (
              <div className="bg-green-50 p-4 lg:p-5 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900">Đăng ký & Tiết kiệm</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSubscription}
                      onChange={(e) => setIsSubscription(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blackmores-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blackmores-teal"></div>
                  </label>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                  Tiết kiệm 30% và miễn phí vận chuyển cho các đơn hàng định kỳ
                </p>
                {isSubscription && (
                  <div className="mt-3">
                    <select
                      value={deliveryFrequency}
                      onChange={(e) => setDeliveryFrequency(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                    >
                      <option value="Giao hàng mỗi 8 tuần (giảm 20%)">Giao hàng mỗi 8 tuần (giảm 20%)</option>
                      <option value="Giao hàng mỗi 4 tuần (giảm 25%)">Giao hàng mỗi 4 tuần (giảm 25%)</option>
                      <option value="Giao hàng mỗi 12 tuần (giảm 15%)">Giao hàng mỗi 12 tuần (giảm 15%)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div className="space-y-1 lg:space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {formatPrice(isSubscription ? subscriptionPrice : product.price)}
                </span>
                <div className="flex items-center space-x-2">
                  {product.originalPrice && (
                    <span className="text-sm sm:text-base lg:text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                  {isSubscription && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                      Tiết kiệm 30%
                    </span>
                  )}
                </div>
              </div>
              {isSubscription && (
                <p className="text-xs sm:text-sm text-gray-600">
                  Giao hàng mỗi 30 ngày (có thể thay đổi bất cứ lúc nào)
                </p>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-3 lg:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <label className="text-sm sm:text-base font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="px-4 py-3 font-medium text-base min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors min-h-[44px] flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-blackmores-teal text-white px-4 lg:px-6 py-3.5 rounded-lg hover:bg-blackmores-teal-dark transition-all duration-300 flex items-center justify-center space-x-2 font-medium text-sm sm:text-base hover:scale-105 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                  <span>{isSubscription ? 'Đăng ký ngay' : 'Thêm vào giỏ hàng'}</span>
                </button>
                <button className="p-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 sm:flex-shrink-0 hover:scale-105 hover:border-red-300 hover:text-red-500 min-h-[48px] flex items-center justify-center">
                  <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                </button>
              </div>
              
              {/* Continue Shopping Button */}
              <button
                onClick={handleContinueShopping}
                className="w-full mt-3 bg-white border-2 border-blackmores-teal text-blackmores-teal px-4 lg:px-6 py-3.5 rounded-lg hover:bg-green-50 transition-all duration-300 font-medium text-sm sm:text-base hover:scale-[1.02] min-h-[48px]"
              >
                Tiếp tục mua sắm
              </button>
            </div>

          </div>
        </div>

        {/* Free Sample CTA Banner */}
        <div className="mt-8 lg:mt-12 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 lg:p-8 text-white shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
              <span className="text-3xl">🎁</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              Chưa chắc chắn về sản phẩm?
            </h2>
            <p className="text-lg lg:text-xl text-orange-100 mb-6 max-w-2xl mx-auto">
              Hãy thử miễn phí trước khi mua! Nhận ngay 2 gói Blackmores để trải nghiệm chất lượng
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-orange-100">
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">✓</span>
                <span>100% miễn phí</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-100">
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">✓</span>
                <span>Giao hàng tận nơi</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-100">
                <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">✓</span>
                <span>Không ràng buộc</span>
              </div>
            </div>
            <Link
              to="/free-sample"
              className="inline-block bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              ĐĂNG KÝ NHẬN MẪU MIỄN PHÍ 🚀
            </Link>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-8 lg:mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
              {[
                { key: 'description', label: 'Mô tả' },
                { key: 'benefits', label: 'Lợi ích' },
                { key: 'ingredients', label: 'Thành phần' },
                { key: 'reviews', label: 'Đánh giá' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`py-3 lg:py-4 px-3 sm:px-4 lg:px-2 border-b-2 font-medium text-sm sm:text-base capitalize transition-colors whitespace-nowrap min-h-[48px] flex items-center ${
                    selectedTab === tab.key
                      ? 'border-blackmores-teal text-blackmores-teal'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6 lg:py-8">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Cách sử dụng</h3>
                <p className="text-gray-600">{product.dosage}</p>
              </div>
            )}

            {selectedTab === 'benefits' && (
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Lợi ích chính</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {product.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blackmores-teal mt-0.5 flex-shrink-0" />
                      <span className="text-sm lg:text-base text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'ingredients' && (
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Thành phần hoạt tính</h3>
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <ul className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-sm lg:text-base text-gray-700 leading-relaxed">
                        • {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-8">
                {/* Message Form */}
                <MessageForm
                  productId={product.id}
                  onMessageSent={() => setMessageRefreshTrigger(prev => prev + 1)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  showRating={true}
                  title="Viết đánh giá"
                />

                {/* Message List */}
                <MessageList
                  productId={product.id}
                  refreshTrigger={messageRefreshTrigger}
                  title="Đánh giá khách hàng"
                />

                {/* Legacy Review Summary - Keep for display */}
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{product.rating}</div>
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {renderStars(product.rating)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">Dựa trên {product.reviews} đánh giá</div>
                      </div>
                      <div className="lg:col-span-2">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="flex items-center space-x-2">
                              <span className="text-xs sm:text-sm w-6 sm:w-8">{star}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full" 
                                  style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                                ></div>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">
                                {star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '7%' : star === 2 ? '2%' : '1%'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">Nguyễn T.</span>
                            <span className="text-sm text-gray-500">Đã xác minh mua hàng</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(5)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">2 tuần trước</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Chất lượng tuyệt vời và hiệu quả</h4>
                      <p className="text-gray-700">
                        Tôi đã sử dụng sản phẩm này được 3 tháng và rất hài lòng với kết quả. 
                        Chất lượng tuyệt vời và tôi có thể cảm nhận được sự khác biệt về mức năng lượng. 
                        Rất khuyến khích!
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <button className="hover:text-gray-700">Hữu ích (12)</button>
                        <button className="hover:text-gray-700">Báo cáo</button>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">Trần M.</span>
                            <span className="text-sm text-gray-500">Đã xác minh mua hàng</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(4)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">1 tháng trước</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Sản phẩm tốt, giao hàng nhanh</h4>
                      <p className="text-gray-700">
                        Sản phẩm tuyệt vời với việc giao hàng nhanh chóng. Tôi nhận thấy sự cải thiện trong sức khỏe tổng thể. 
                        Dịch vụ đăng ký rất tiện lợi và tiết kiệm tiền. Sẽ tiếp tục sử dụng.
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <button className="hover:text-gray-700">Hữu ích (8)</button>
                        <button className="hover:text-gray-700">Báo cáo</button>
                      </div>
                    </div>

                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">Jennifer L.</span>
                            <span className="text-sm text-gray-500">Verified Purchase</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(5)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">3 weeks ago</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Trusted brand, reliable results</h4>
                      <p className="text-gray-700">
                        Blackmores has always been my go-to brand for supplements. This product is no exception - 
                        high quality, effective, and reasonably priced. Customer service is also excellent.
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <button className="hover:text-gray-700">Helpful (15)</button>
                        <button className="hover:text-gray-700">Report</button>
                      </div>
                    </div>

                    <div className="pb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">David K.</span>
                            <span className="text-sm text-gray-500">Verified Purchase</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(4)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">1 week ago</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Good value for money</h4>
                      <p className="text-gray-700">
                        Solid product at a fair price. I've been taking it for about 6 weeks and feel more energetic. 
                        The packaging is good and the tablets are easy to swallow. Would recommend to others.
                      </p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <button className="hover:text-gray-700">Helpful (6)</button>
                        <button className="hover:text-gray-700">Report</button>
                      </div>
                    </div>
                  </div>

                  {/* Load More Reviews */}
                  <div className="text-center">
                    <button className="bg-gray-100 text-gray-700 px-4 lg:px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base min-h-[44px]">
                      Xem thêm đánh giá
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;