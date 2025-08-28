import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, categories, genderAgeOptions, ingredientOptions, healthGoalOptions, Product } from '../data/products';

const HomePage: React.FC = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const categoryFromUrl = urlParams.get('category') || 'All Products';
  const searchFromUrl = urlParams.get('search') || '';
  const genderAgeFromUrl = urlParams.get('genderAge') || 'All';
  const ingredientFromUrl = urlParams.get('ingredient') || 'All';
  const healthGoalFromUrl = urlParams.get('healthGoal') || 'All';
  
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedGenderAge, setSelectedGenderAge] = useState(genderAgeFromUrl);
  const [selectedIngredient, setSelectedIngredient] = useState(ingredientFromUrl);
  const [selectedHealthGoal, setSelectedHealthGoal] = useState(healthGoalFromUrl);

  // State for products loaded from Supabase
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Update search query when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newSearchFromUrl = urlParams.get('search') || '';
    const newCategoryFromUrl = urlParams.get('category') || 'All Products';
    const newGenderAgeFromUrl = urlParams.get('genderAge') || 'All';
    const newIngredientFromUrl = urlParams.get('ingredient') || 'All';
    const newHealthGoalFromUrl = urlParams.get('healthGoal') || 'All';

    if (newSearchFromUrl !== searchQuery) setSearchQuery(newSearchFromUrl);
    if (newCategoryFromUrl !== selectedCategory) setSelectedCategory(newCategoryFromUrl);
    if (newGenderAgeFromUrl !== selectedGenderAge) setSelectedGenderAge(newGenderAgeFromUrl);
    if (newIngredientFromUrl !== selectedIngredient) setSelectedIngredient(newIngredientFromUrl);
    if (newHealthGoalFromUrl !== selectedHealthGoal) setSelectedHealthGoal(newHealthGoalFromUrl);
  }, [location.search]);

  // Update URL when search or category changes
  const updateURL = (newSearch: string, newCategory: string, newGenderAge: string, newIngredient: string, newHealthGoal: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCategory !== 'All Products') params.set('category', newCategory);
    if (newGenderAge !== 'All') params.set('genderAge', newGenderAge);
    if (newIngredient !== 'All') params.set('ingredient', newIngredient);
    if (newHealthGoal !== 'All') params.set('healthGoal', newHealthGoal);
    
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    window.history.pushState({}, '', newUrl);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateURL(value, selectedCategory, selectedGenderAge, selectedIngredient, selectedHealthGoal);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateURL(searchQuery, category, selectedGenderAge, selectedIngredient, selectedHealthGoal);
    
    // Auto-scroll to products section after category selection
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleGenderAgeChange = (genderAge: string) => {
    setSelectedGenderAge(genderAge);
    updateURL(searchQuery, selectedCategory, genderAge, selectedIngredient, selectedHealthGoal);
    
    // Auto-scroll to products section after filter selection
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleIngredientChange = (ingredient: string) => {
    setSelectedIngredient(ingredient);
    updateURL(searchQuery, selectedCategory, selectedGenderAge, ingredient, selectedHealthGoal);
    
    // Auto-scroll to products section after filter selection
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleHealthGoalChange = (healthGoal: string) => {
    setSelectedHealthGoal(healthGoal);
    updateURL(searchQuery, selectedCategory, selectedGenderAge, selectedIngredient, healthGoal);
    
    // Auto-scroll to products section after filter selection
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All Products' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // New filter conditions
    const matchesGenderAge = selectedGenderAge === 'All' || (product.genderAgeCategories && product.genderAgeCategories.includes(selectedGenderAge));
    const matchesIngredient = selectedIngredient === 'All' || (product.productIngredients && product.productIngredients.includes(selectedIngredient));
    const matchesHealthGoal = selectedHealthGoal === 'All' || (product.healthGoals && product.healthGoals.includes(selectedHealthGoal));

    return matchesCategory && matchesSearch && matchesGenderAge && matchesIngredient && matchesHealthGoal;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low-high':
        return a.price - b.price;
      case 'price-high-low':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Giải Pháp Sức Khỏe Tự Nhiên
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-green-100 px-4">
              Hỗ trợ sức khỏe của bạn với các sản phẩm bổ sung chất lượng cao
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
              <button 
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-blackmores-teal px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4">
            {/* Search */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Category Filter */}
              <div className="relative col-span-2 sm:col-span-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Gender/Age Filter */}
              <div className="relative">
                <select
                  value={selectedGenderAge}
                  onChange={(e) => handleGenderAgeChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                >
                  {genderAgeOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'Tất cả độ tuổi/giới tính' : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Ingredient Filter */}
              <div className="relative">
                <select
                  value={selectedIngredient}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                >
                  {ingredientOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'Tất cả thành phần' : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Health Goal Filter */}
              <div className="relative">
                <select
                  value={selectedHealthGoal}
                  onChange={(e) => handleHealthGoalChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                >
                  {healthGoalOptions.map(option => (
                    <option key={option} value={option}>
                      {option === 'All' ? 'Tất cả mục tiêu sức khỏe' : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent hover:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="featured">Nổi bật</option>
                  <option value="name">Tên A-Z</option>
                  <option value="price-low-high">Giá: Thấp đến Cao</option>
                  <option value="price-high-low">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Sản phẩm'} ({sortedProducts.length} sản phẩm)
            </h2>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="text-blackmores-teal hover:text-blackmores-teal-dark text-sm font-medium"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== 'All Products' || selectedGenderAge !== 'All' || selectedIngredient !== 'All' || selectedHealthGoal !== 'All' || searchQuery) && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Tìm kiếm: "{searchQuery}"
                    <button
                      onClick={() => handleSearchChange('')}
                      className="ml-2 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'All Products' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blackmores-teal text-white">
                    {selectedCategory}
                    <button
                      onClick={() => handleCategoryChange('All Products')}
                      className="ml-2 hover:text-gray-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedGenderAge !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedGenderAge}
                    <button
                      onClick={() => handleGenderAgeChange('All')}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedIngredient !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedIngredient}
                    <button
                      onClick={() => handleIngredientChange('All')}
                      className="ml-2 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedHealthGoal !== 'All' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {selectedHealthGoal}
                    <button
                      onClick={() => handleHealthGoalChange('All')}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {sortedProducts.length === 0 ? (
            loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All Products');
                    setSelectedGenderAge('All');
                    setSelectedIngredient('All');
                    setSelectedHealthGoal('All');
                    setSearchQuery('');
                    updateURL('', 'All Products', 'All', 'All', 'All');
                  }}
                  className="mt-4 text-blackmores-teal hover:text-blackmores-teal-dark text-sm font-medium"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Blackmores?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hơn 90 năm kinh nghiệm trong lĩnh vực sức khỏe tự nhiên
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Kiểm tra nghiêm ngặt và đảm bảo chất lượng cho mọi sản phẩm
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Expert Formulation</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Được phát triển bởi đội ngũ chuyên gia dinh dưỡng và sức khỏe
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blackmores-teal rounded-full"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Trusted Heritage</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Thương hiệu sức khỏe tự nhiên được tin tưởng nhất Australia từ 1930
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;