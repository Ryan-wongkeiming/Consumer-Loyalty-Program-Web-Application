import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, Star, Clock, User, ShoppingCart, Heart } from 'lucide-react';
import { searchSiteContent, SearchResult } from '../data/searchData';
import { useCart } from '../context/CartContext';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const { dispatch } = useCart();
  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery) {
        setLoading(true);
        try {
          const searchResults = await searchSiteContent(searchQuery);
          setResults(searchResults);
          setFilteredResults(searchResults);
        } catch (error) {
          console.error('Error performing search:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery]);

  useEffect(() => {
    let filtered = results;
    
    // Apply filter
    if (selectedFilter !== 'All') {
      filtered = results.filter(result => result.type === selectedFilter);
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
          if (a.publishDate && b.publishDate) {
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          }
          return 0;
        case 'rating':
          if (a.rating && b.rating) {
            return b.rating - a.rating;
          }
          return 0;
        case 'price-low':
          if (a.price && b.price) {
            return a.price - b.price;
          }
          return 0;
        case 'price-high':
          if (a.price && b.price) {
            return b.price - a.price;
          }
          return 0;
        default:
          return 0;
      }
    });
    
    setFilteredResults(sorted);
  }, [results, selectedFilter, sortBy]);

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

  const handleAddToCart = (result: SearchResult) => {
    if (result.type === 'Product') {
      const product = {
        id: result.id,
        name: result.title,
        description: result.description,
        price: result.price || 0,
        originalPrice: result.originalPrice,
        image: result.image,
        category: result.category,
        benefits: [],
        ingredients: [],
        dosage: '',
        rating: result.rating || 0,
        reviews: result.reviews || 0,
        inStock: true,
        isSubscription: false
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
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-6 h-6 text-blackmores-teal" />
            <h1 className="text-2xl font-bold text-gray-900">
              Kết quả tìm kiếm cho "{searchQuery}"
            </h1>
          </div>
          
          <p className="text-gray-600">
            Tìm thấy {filteredResults.length} kết quả trong sản phẩm, bài viết và chủ đề sức khỏe
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
              >
                <option value="All">Tất cả kết quả</option>
                <option value="Product">Sản phẩm</option>
                <option value="Article">Bài viết</option>
                <option value="Topic">Chủ đề sức khỏe</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
              >
                <option value="relevance">Liên quan</option>
                <option value="title">Tiêu đề A-Z</option>
                <option value="date">Mới nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price-low">Giá: Thấp đến Cao</option>
                <option value="price-high">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tìm kiếm...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600 mb-6">
              Thử điều chỉnh từ khóa tìm kiếm hoặc duyệt các danh mục của chúng tôi
            </p>
            <Link
              to="/"
              className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
            >
              Duyệt tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredResults.map((result) => (
              <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <Link to={result.url}>
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full md:w-32 h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                        />
                      </Link>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            result.type === 'Product' ? 'bg-purple-100 text-purple-800' :
                            result.type === 'Article' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {result.type}
                          </span>
                          <span className="text-xs text-blackmores-teal font-medium bg-green-50 px-2 py-1 rounded">
                            {result.category}
                          </span>
                        </div>
                        
                        {result.type === 'Product' && (
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <Link to={result.url}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blackmores-teal transition-colors line-clamp-2">
                          {result.title}
                        </h3>
                      </Link>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {result.description}
                      </p>

                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        {result.author && (
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{result.author}</span>
                          </div>
                        )}
                        {result.readTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{result.readTime}</span>
                          </div>
                        )}
                        {result.publishDate && (
                          <span>{formatDate(result.publishDate)}</span>
                        )}
                        {result.rating && (
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center">
                              {renderStars(result.rating)}
                            </div>
                            <span>({result.reviews} reviews)</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {result.type === 'Product' && result.price && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold text-blackmores-teal">
                                {formatPrice(result.price)}
                              </span>
                              {result.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(result.originalPrice)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {result.type === 'Product' ? (
                            <>
                              <button
                                onClick={() => handleAddToCart(result)}
                                className="bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-all duration-300 flex items-center space-x-2 text-sm font-medium hover:scale-105"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>Thêm vào giỏ</span>
                              </button>
                              <Link
                                to={result.url}
                                className="border border-blackmores-teal text-blackmores-teal px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-300 text-sm font-medium hover:scale-105"
                              >
                                Xem chi tiết
                              </Link>
                            </>
                          ) : (
                            <Link
                              to={result.url}
                              className="bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-all duration-300 text-sm font-medium hover:scale-105"
                            >
                              Đọc thêm
                            </Link>
                          )}
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
    </div>
  );
};

export default SearchResultsPage;