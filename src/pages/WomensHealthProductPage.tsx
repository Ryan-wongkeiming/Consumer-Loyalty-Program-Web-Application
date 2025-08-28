import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart, Truck, Shield, RefreshCw, CheckCircle, ChevronDown } from 'lucide-react';
import { womensHealthProducts } from '../data/womensHealthProducts';
import { useCart } from '../context/CartContext';

const WomensHealthProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = womensHealthProducts.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedSku, setSelectedSku] = useState(product?.skus[0]);
  const [selectedTab, setSelectedTab] = useState('description');
  const { dispatch } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h1>
          <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại.</p>
          <Link
            to="/womens-health"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
            Quay lại Sức khỏe phụ nữ
          </Link>
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!selectedSku) return;
    
    // Convert to the format expected by the cart
    const cartProduct = {
      id: product.id,
      name: `${product.name} - ${selectedSku.title}`,
      description: product.description,
      price: selectedSku.price,
      image: product.image,
      category: product.category,
      benefits: product.benefits,
      ingredients: product.ingredients,
      dosage: product.dosage,
      rating: product.rating,
      reviews: product.reviews,
      inStock: product.inStock
    };

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product: cartProduct,
        quantity,
        isSubscription: false,
        deliveryFrequency: '',
      },
    });
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blackmores-teal hover:text-blackmores-teal-dark">
             Trung tâm sức khỏe
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/womens-health" className="text-blackmores-teal hover:text-blackmores-teal-dark">
             Sức khỏe phụ nữ
            </Link>
            <span className="text-gray-400">/</span>
           <span className="text-gray-900 font-medium">Sản phẩm</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/womens-health"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Women's Health
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Truck className="w-6 h-6 text-blackmores-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free Shipping</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Shield className="w-6 h-6 text-blackmores-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Quality Assured</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <RefreshCw className="w-6 h-6 text-blackmores-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <span className="text-sm text-blackmores-teal font-medium bg-green-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* SKU Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Kích cỡ:</label>
              <div className="space-y-2">
                {product.skus.map((sku) => (
                  <div
                    key={sku.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSku?.id === sku.id
                        ? 'border-blackmores-teal bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSku(sku)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{sku.title}</p>
                        <p className="text-sm text-gray-600">{sku.pricePerUnit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blackmores-teal">
                          ₫{sku.price.toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Display */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₫{(selectedSku?.price || product.price).toLocaleString('vi-VN')}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₫{product.originalPrice.toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
              {selectedSku && (
                <p className="text-sm text-gray-600">
                  {selectedSku.pricePerUnit}
                </p>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Số lượng:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium ${
                    product.inStock
                      ? 'bg-blackmores-teal text-white hover:bg-blackmores-teal-dark'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Product Highlights */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Lợi ích chính:</h3>
              <div className="space-y-2">
                {product.benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
             {[
               { key: 'description', label: 'Mô tả' },
               { key: 'benefits', label: 'Lợi ích' },
               { key: 'ingredients', label: 'Thành phần' },
               { key: 'dosage', label: 'Liều dùng' },
               { key: 'warnings', label: 'Cảnh báo' },
               { key: 'reviews', label: 'Đánh giá' }
             ].map((tab) => (
                <button
                 key={tab.key}
                 onClick={() => setSelectedTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
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

          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            )}

            {selectedTab === 'benefits' && (
              <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-6">Lợi ích chính</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-blackmores-teal mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'ingredients' && (
              <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-6">Thành phần hoạt tính</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <ul className="space-y-3">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700 border-b border-gray-200 pb-2 last:border-b-0">
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'dosage' && (
              <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-6">Cách sử dụng</h3>
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">{product.dosage}</p>
                </div>
              </div>
            )}

            {selectedTab === 'warnings' && (
              <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-6">Thông tin quan trọng</h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                  <ul className="space-y-2">
                    {product.warnings.map((warning, index) => (
                      <li key={index} className="text-gray-700 text-sm">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-semibold text-gray-900">Đánh giá khách hàng</h3>
                  <button className="bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors">
                   Viết đánh giá
                  </button>
                </div>

                {/* Review Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{product.rating}</div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {renderStars(product.rating)}
                      </div>
                      <div className="text-sm text-gray-600">Based on {product.reviews} reviews</div>
                      <div className="text-sm text-gray-600">Dựa trên {product.reviews} đánh giá</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center space-x-2">
                            <span className="text-sm w-8">{star}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${star === 5 ? 65 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {star === 5 ? '65%' : star === 4 ? '25%' : star === 3 ? '7%' : star === 2 ? '2%' : '1%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews - Cranberry Forte Specific */}
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Michelle T.</span>
                          <span className="text-sm text-gray-500">Verified Purchase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(5)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">5 days ago</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Life-changing for UTI prevention</h4>
                    <p className="text-gray-700">
                      After suffering from recurrent UTIs, my doctor recommended this cranberry supplement. 
                      I've been taking it for 4 months now and haven't had a single episode! The concentrated formula really works.
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <button className="hover:text-gray-700">Helpful (24)</button>
                      <button className="hover:text-gray-700">Report</button>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Karen S.</span>
                          <span className="text-sm text-gray-500">Verified Purchase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(4)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">High quality cranberry extract</h4>
                    <p className="text-gray-700">
                      I've tried other cranberry supplements but this one is definitely the most effective. 
                      The 50,000mg concentration is impressive and I can feel the difference. Great value for the quality.
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <button className="hover:text-gray-700">Helpful (16)</button>
                      <button className="hover:text-gray-700">Report</button>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Jessica W.</span>
                          <span className="text-sm text-gray-500">Verified Purchase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(5)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Perfect for women's health</h4>
                    <p className="text-gray-700">
                      As someone who's prone to urinary tract issues, this has been a game-changer. 
                      I take 2 capsules daily as recommended and it's been 6 months without any problems. Highly recommend!
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <button className="hover:text-gray-700">Helpful (21)</button>
                      <button className="hover:text-gray-700">Report</button>
                    </div>
                  </div>

                  <div className="pb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Sophie L.</span>
                          <span className="text-sm text-gray-500">Verified Purchase</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(4)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">6 weeks ago</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Good preventative care</h4>
                    <p className="text-gray-700">
                      I started taking this as a preventative measure and it's working well. 
                      No side effects and easy to incorporate into my daily routine. The 90 capsule size is convenient.
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <button className="hover:text-gray-700">Helpful (11)</button>
                      <button className="hover:text-gray-700">Report</button>
                    </div>
                  </div>
                </div>

                {/* Load More Reviews */}
                <div className="text-center">
                  <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Tải thêm đánh giá
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensHealthProductPage;