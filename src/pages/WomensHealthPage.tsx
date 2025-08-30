import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, ChevronDown, Star, ShoppingCart, Heart, Clock, User } from 'lucide-react';
import { getArticles, Article } from '../data/articles';
import { getTopics, Topic } from '../data/topics';
import { womensHealthProducts } from '../data/womensHealthProducts';

interface HealthPost {
  id: string;
  title: string;
  summary: string;
  image: string;
  type: 'Article' | 'Topic' | 'Product';
  category: string;
  publishDate: string;
  readTime?: string;
  author?: string;
  rating?: number;
  reviews?: number;
  price?: number;
  originalPrice?: number;
}

const WomensHealthPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [healthPosts, setHealthPosts] = useState<HealthPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadHealthContent = async () => {
      try {
        const [articles, topics] = await Promise.all([
          getArticles(),
          getTopics()
        ]);
        
        const allPosts: HealthPost[] = [
          // Convert articles to health posts
          ...articles.map(article => ({
            id: article.id,
            title: article.title,
            summary: article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
            image: article.image,
            type: 'Article' as const,
            category: article.category,
            publishDate: article.publish_date,
            readTime: article.read_time,
            author: article.author
          })),
          // Convert topics to health posts
          ...topics.map(topic => ({
            id: topic.id,
            title: topic.title,
            summary: topic.overview.substring(0, 200) + '...',
            image: topic.image,
            type: 'Topic' as const,
            category: topic.category,
            publishDate: topic.publish_date,
            readTime: '8 min read',
            author: 'Health Team'
          })),
          // Convert women's health products to health posts
          ...womensHealthProducts.map(product => ({
            id: product.id,
            title: product.name,
            summary: product.description,
            image: product.image,
            type: 'Product' as const,
            category: product.category,
            publishDate: '2024-01-15',
            rating: product.rating,
            reviews: product.reviews,
            price: product.price,
            originalPrice: product.originalPrice
          }))
        ];
        
        setHealthPosts(allPosts);
      } catch (error) {
        console.error('Error loading health content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHealthContent();
  }, []);

  const filterOptions = ['All', 'Articles', 'Topics', 'Products'];

  const filteredPosts = healthPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         (selectedFilter === 'Articles' && post.type === 'Article') ||
                         (selectedFilter === 'Topics' && post.type === 'Topic') ||
                         (selectedFilter === 'Products' && post.type === 'Product');
    return matchesSearch && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      case 'oldest':
        return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blackmores-teal hover:text-blackmores-teal-dark">
              Health hub
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Women's health</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sức khỏe phụ nữ
            </h1>
            <div className="w-24 h-1 bg-white mb-6"></div>
            <p className="text-xl text-green-100 leading-relaxed">
              Khám phá những hiểu biết chuyên sâu, giải pháp tự nhiên và thông tin dựa trên bằng chứng khoa học 
              để hỗ trợ sức khỏe và hạnh phúc của bạn ở mọi giai đoạn cuộc đời.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm chủ đề sức khỏe phụ nữ..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Content Type Filter */}
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
                >
                  {filterOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'Tất cả' : 
                       option === 'Articles' ? 'Bài viết' :
                       option === 'Topics' ? 'Chủ đề' :
                       option === 'Products' ? 'Sản phẩm' : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
                >
                  <option value="latest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="title">Tiêu đề A-Z</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Free Sample CTA Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                🎁 Dùng thử cho bé?
              </h2>
              <p className="text-orange-100">2 gói miễn phí!</p>
            </div>
            <Link
              to="/free-sample"
              className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedFilter === 'All' ? 'Tất cả' : 
             selectedFilter === 'Articles' ? 'Bài viết' :
             selectedFilter === 'Topics' ? 'Chủ đề' :
             selectedFilter === 'Products' ? 'Sản phẩm' : selectedFilter} ({sortedPosts.length} kết quả)
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
            <p className="text-gray-500 text-lg">Đang tải nội dung...</p>
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy nội dung phù hợp với tiêu chí của bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col h-full">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.type === 'Article' ? 'bg-blue-100 text-blue-800' :
                      post.type === 'Topic' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {post.type}
                    </span>
                  </div>
                  {post.type === 'Product' && (
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3">
                    <span className="text-xs text-blackmores-teal font-medium bg-green-50 px-2 py-1 rounded">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blackmores-teal transition-colors cursor-pointer h-12 flex items-start">
                    <Link 
                      to={
                        post.type === 'Product' ? `/womens-health/product/${post.id}` :
                        post.type === 'Article' ? `/womens-health/article/${post.id}` : 
                        `/womens-health/topic/${post.id}`
                      }
                      className="hover:text-blackmores-teal transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-16 flex-1">
                    {post.summary}
                  </p>

                  {/* Meta Information Container */}
                  <div className="h-16 flex flex-col justify-end mb-4">
                    {/* Article/Topic Meta */}
                    {(post.type === 'Article' || post.type === 'Topic') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            {post.readTime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{post.readTime}</span>
                              </div>
                            )}
                            {post.author && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span className="truncate max-w-20">{post.author}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs">{formatDate(post.publishDate)}</span>
                        </div>
                      </div>
                    )}

                    {/* Product Meta */}
                    {post.type === 'Product' && (
                      <div className="space-y-2">
                        {post.rating && (
                          <div className="flex items-center">
                            <div className="flex items-center space-x-1">
                              {renderStars(post.rating)}
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              ({post.reviews} reviews)
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(post.price!)}
                          </span>
                          {post.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(post.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {post.type === 'Product' ? (
                      <div className="flex space-x-2">
                        <Link
                          to={`/womens-health/product/${post.id}`}
                          className="flex-1 bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-all duration-300 flex items-center justify-center space-x-2 text-sm font-medium hover:scale-105"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Mua ngay</span>
                        </Link>
                        <Link
                          to={`/womens-health/product/${post.id}`}
                          className="px-3 py-2 border border-blackmores-teal text-blackmores-teal rounded-lg hover:bg-green-50 transition-all duration-300 text-sm font-medium flex-shrink-0 hover:scale-105"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <Link
                          to={post.type === 'Article' ? `/womens-health/article/${post.id}` : `/womens-health/topic/${post.id}`}
                          className="text-blackmores-teal hover:text-blackmores-teal-dark font-medium text-sm flex items-center space-x-1 group"
                        >
                          <span>Đọc thêm</span>
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {sortedPosts.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to="/womens-health?page=2"
              className="bg-blackmores-teal text-white px-8 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors font-medium inline-block"
            >
              Tải thêm kết quả
            </Link>
          </div>
        )}
      </div>

      {/* Why Choose Blackmores Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Blackmores cho sức khỏe phụ nữ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hơn 90 năm kinh nghiệm trong lĩnh vực sức khỏe tự nhiên, được nghiên cứu đặc biệt cho phụ nữ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Formulation</h3>
              <p className="text-gray-600">
                Sản phẩm được thiết kế đặc biệt để hỗ trợ nhu cầu sức khỏe độc đáo của phụ nữ ở mọi giai đoạn cuộc đời
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Evidence-Based</h3>
              <p className="text-gray-600">
                Tất cả khuyến nghị đều được hỗ trợ bởi nghiên cứu khoa học và các nghiên cứu lâm sàng
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Quality</h3>
              <p className="text-gray-600">
                Thành phần chất lượng cao với kiểm tra nghiêm ngặt và đảm bảo chất lượng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomensHealthPage;