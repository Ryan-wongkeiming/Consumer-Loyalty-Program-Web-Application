import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getUserWishlist, removeFromWishlist } from '../lib/auth';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price: number | null;
    image: string;
    category: string;
    rating: number;
    reviews: number;
    in_stock: boolean;
  };
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { dispatch } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const items = await getUserWishlist();
      setWishlistItems(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    
    try {
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    const product = {
      id: item.products.id,
      name: item.products.name,
      description: item.products.description,
      price: item.products.price,
      originalPrice: item.products.original_price,
      image: item.products.image,
      category: item.products.category,
      benefits: [],
      ingredients: [],
      dosage: '',
      rating: item.products.rating,
      reviews: item.products.reviews,
      inStock: item.products.in_stock
    };

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        quantity: 1,
        isSubscription: false,
        deliveryFrequency: '',
      },
    });
    dispatch({ type: 'TOGGLE_CART' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem danh sách yêu thích</p>
          <Link
            to="/"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
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
          <Link
            to="/profile"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại hồ sơ
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Danh sách yêu thích</h1>
              <p className="text-green-100">Các sản phẩm bạn đã lưu để mua sau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tải danh sách yêu thích...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Danh sách yêu thích trống</h3>
            <p className="text-gray-600 mb-6">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
            <Link
              to="/"
              className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <Link to={`/product/${item.products.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.products.image}
                      alt={item.products.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="text-xs text-blackmores-teal font-medium bg-green-50 px-2 py-1 rounded">
                      {item.products.category}
                    </span>
                  </div>

                  <Link to={`/product/${item.products.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blackmores-teal transition-colors line-clamp-2 h-12 flex items-start">
                      {item.products.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3 h-16 flex-1">
                    {item.products.description}
                  </p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(item.products.rating)}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.products.reviews} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.products.price)}
                      </span>
                      {item.products.original_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.products.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.products.in_stock}
                      className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium hover:scale-105 ${
                        item.products.in_stock
                          ? 'bg-blackmores-teal text-white hover:bg-blackmores-teal-dark shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{item.products.in_stock ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.product_id)}
                      disabled={removingItems.has(item.product_id)}
                      className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-300 disabled:opacity-50 hover:scale-105"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      {removingItems.has(item.product_id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;