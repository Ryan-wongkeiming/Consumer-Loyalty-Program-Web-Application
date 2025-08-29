import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a Link
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity: 1,
        isSubscription: product.isSubscription || false,
        deliveryFrequency: product.isSubscription ? 'Delivered every 8 weeks (20% off)' : '',
      },
    });
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full hover:scale-[1.02] min-h-[400px]">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-44 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm font-semibold">
              TIẾT KIỆM {formatPrice(product.originalPrice - product.price)}
            </div>
          )}
          {product.isSubscription && (
            <div className="absolute top-2 right-2 bg-green-700 text-white px-2 py-1 rounded text-xs sm:text-sm font-semibold">
              ĐĂNG KÝ
            </div>
          )}
          <button className="absolute bottom-2 right-2 p-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-xs sm:text-sm text-blackmores-teal font-medium bg-green-50 px-2 py-1 rounded truncate">
            {product.category}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-900 mb-3 hover:text-blackmores-teal transition-colors line-clamp-2 h-12 sm:h-14 flex items-start leading-tight">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3 h-14 sm:h-16 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center mb-4 flex-wrap">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 ml-2">
            ({product.reviews} đánh giá)
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-base sm:text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <button className="p-2.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 rounded-lg hover:bg-gray-50">
              <Heart className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`px-3 sm:px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium flex-1 justify-center min-h-[44px] ${
                product.inStock 
                  ? 'bg-blackmores-teal text-white hover:bg-blackmores-teal-dark' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4 flex-shrink-0" />
              <span>{product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;