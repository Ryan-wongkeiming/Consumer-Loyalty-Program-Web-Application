import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, Heart, ChevronDown, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/products';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useCart();
  const { user, profile, signOut, loading } = useAuth();
  
  // Check for auth parameter in URL to auto-open auth modal
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const authParam = urlParams.get('auth');
    if (authParam === 'signin' || authParam === 'signup') {
      setAuthModalMode(authParam);
      setIsAuthModalOpen(true);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.search]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsProductsDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    if (isProductsDropdownOpen || isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProductsDropdownOpen, isUserDropdownOpen]);

  const navigation = [
    { name: 'Sản phẩm', href: '/' },
    { name: 'Đăng kí nhận mẫu', href: '/free-sample' },
    { name: 'Chương trình tích điểm', href: '/loyalty' },
    { name: 'Health Hub', href: '/womens-health' },
    { name: 'Về chúng tôi', href: '/about' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to dedicated search results page
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as any);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="https://www.blackmores.com.au/-/media/project/blackmores-group/au/logo/blackmroes-logo.svg?iar=0&hash=6C4AFC91AD53B13B6ACCFEB452D06F68"
              alt="Blackmores"
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => {
              if (item.name === 'Sản phẩm') {
                return (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                      className={`flex items-center justify-center space-x-1 text-gray-700 hover:text-blackmores-teal px-2 py-2 text-sm font-medium transition-colors text-center ${
                        location.pathname === item.href ? 'text-blackmores-teal border-b-2 border-blackmores-teal' : ''
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isProductsDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isProductsDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          to="/"
                          onClick={() => {
                            setIsProductsDropdownOpen(false);
                            // Auto-scroll to products section after navigation
                            setTimeout(() => {
                              const productsSection = document.getElementById('products-section');
                              if (productsSection) {
                                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 300);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors font-medium"
                        >
                          Tất cả sản phẩm
                        </Link>
                        <div className="border-t border-gray-100 my-2"></div>
                        {categories.filter(cat => cat !== 'All Products').map((category) => (
                          <Link
                            key={category}
                            to={`/?category=${encodeURIComponent(category)}`}
                            onClick={() => {
                              setIsProductsDropdownOpen(false);
                              // Auto-scroll to products section after navigation
                              setTimeout(() => {
                                const productsSection = document.getElementById('products-section');
                                if (productsSection) {
                                  productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }, 300);
                            }}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors"
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-gray-700 hover:text-blackmores-teal px-2 py-2 text-sm font-medium transition-colors text-center flex items-center justify-center ${
                    location.pathname === item.href ? 'text-blackmores-teal border-b-2 border-blackmores-teal' : ''
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blackmores-teal transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Free Sample CTA Button */}
            <Link
              to="/free-sample"
              className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse"
            >
              <span>🎁</span>
              <span>Nhận mẫu miễn phí</span>
            </Link>

            {/* User Account */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blackmores-teal transition-colors rounded-lg hover:bg-gray-50"
                >
                  <User className="w-6 h-6" />
                  <span className="hidden lg:block text-sm font-medium">
                    {profile?.full_name || user.email?.split('@')[0] || 'Tài khoản'}
                  </span>
                  <ChevronDown className="hidden lg:block w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('signin')}
                  className="p-2 text-gray-600 hover:text-blackmores-teal transition-colors rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  <User className="w-6 h-6" />
                </button>
              )}
              
              {/* User Dropdown */}
              {user && isUserDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || 'Người dùng'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors"
                    >
                      Thông tin cá nhân
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors"
                    >
                      Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors"
                    >
                      Danh sách yêu thích
                    </Link>
                    <Link
                      to="/addresses"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blackmores-teal transition-colors"
                    >
                      Địa chỉ giao hàng
                    </Link>
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              to="/wishlist"
              className="p-2.5 text-gray-600 hover:text-blackmores-teal transition-colors rounded-lg hover:bg-gray-50 relative min-h-[44px] flex items-center justify-center"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="p-2.5 text-gray-600 hover:text-blackmores-teal transition-colors relative rounded-lg hover:bg-gray-50 min-h-[44px] flex items-center justify-center"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blackmores-teal text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1 font-medium">
                  {state.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2.5 text-gray-600 hover:text-blackmores-teal min-h-[44px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blackmores-teal transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
          <nav className="px-4 pb-6 space-y-1">
            {navigation.map((item) => {
              if (item.name === 'Sản phẩm') {
                return (
                  <div key={item.name}>
                    <div className="px-3 py-3 text-gray-700 font-medium text-base">
                      {item.name}
                    </div>
                    <div className="ml-4 space-y-0.5">
                      <Link
                        to="/"
                        className="block px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tất cả sản phẩm
                      </Link>
                      {categories.filter(cat => cat !== 'All Products').map((category) => (
                        <Link
                          key={category}
                          to={`/?category=${encodeURIComponent(category)}`}
                          className="block px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                          onClick={() => {
                            setIsMenuOpen(false);
                            // Auto-scroll to products section after navigation
                            setTimeout(() => {
                              const productsSection = document.getElementById('products-section');
                              if (productsSection) {
                                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 200);
                          }}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-3 text-gray-700 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Free Sample CTA for Mobile */}
            <div className="border-t border-gray-200 pt-4">
              <Link
                to="/free-sample"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-4 rounded-lg font-bold text-center text-base min-h-[52px] flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>🎁</span>
                <span>NHẬN MẪU MIỄN PHÍ NGAY!</span>
              </Link>
            </div>

            {/* Auth buttons for mobile */}
            {!user && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="block w-full text-left px-3 py-3 text-blackmores-teal hover:bg-gray-50 rounded-md font-medium text-base min-h-[44px] flex items-center"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="block w-full text-left px-3 py-3 bg-blackmores-teal text-white hover:bg-blackmores-teal-dark rounded-md font-medium text-base min-h-[44px] flex items-center"
                >
                  Đăng ký
                </button>
              </div>
            )}
            
            {user && (
              <div>
                <div className="px-3 py-3 text-gray-700 font-medium text-base">
                  {profile?.full_name || user.email?.split('@')[0] || 'Tài khoản'}
                </div>
                <div className="ml-4 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                  >
                    Đơn hàng của tôi
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                  >
                    Danh sách yêu thích
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-3 text-gray-600 hover:text-blackmores-teal hover:bg-gray-50 rounded-md text-sm sm:text-base min-h-[44px] flex items-center"
                  >
                    Địa chỉ giao hàng
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-3 py-3 text-red-600 hover:bg-red-50 rounded-md text-sm sm:text-base min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
};

export default Header;