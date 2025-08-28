import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Settings, Save, Edit, Plus, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, saveUserAddress, getUserAddresses, updatePassword, getUserMessages, deleteUserMessage } from '../lib/auth';
import { getUserLoyaltyPoints } from '../lib/auth';
import { supabase } from '../lib/supabaseClient';
import { getAllProvinces, getWardsByProvince, Province, Ward } from '../utils/locationData';
import SearchableSelect from '../components/SearchableSelect';

interface UserAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  ward: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface UserMessage {
  id: string;
  content: string;
  message_type: 'text' | 'image' | 'video';
  media_url: string | null;
  rating: number | null;
  created_at: string;
  products: {
    id: string;
    name: string;
    image: string;
  } | null;
}

const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Personal info form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    marketing_consent: false
  });

  // Address management state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    label: 'Nhà riêng',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    ward: '',
    is_default: false
  });

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Messages state
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Loyalty points state
  const [loyaltyPoints, setLoyaltyPoints] = useState({ total_points: 0, last_updated_at: null });
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);

  // Load initial data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        marketing_consent: profile.marketing_consent || false
      });
    }
  }, [profile]);

  useEffect(() => {
    setProvinces(getAllProvinces());
    loadAddresses();
    loadUserMessages();
    loadLoyaltyPoints();
  }, []);

  useEffect(() => {
    if (addressFormData.city) {
      setWards(getWardsByProvince(addressFormData.city));
      setAddressFormData(prev => ({ ...prev, ward: '' }));
    } else {
      setWards([]);
    }
  }, [addressFormData.city]);

  const loadAddresses = async () => {
    try {
      const userAddresses = await getUserAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const loadUserMessages = async () => {
    setLoadingMessages(true);
    try {
      const messages = await getUserMessages();
      setUserMessages(messages);
    } catch (error) {
      console.error('Error loading user messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadLoyaltyPoints = async () => {
    setLoadingLoyalty(true);
    try {
      const points = await getUserLoyaltyPoints();
      setLoyaltyPoints(points);
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    } finally {
      setLoadingLoyalty(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
      return;
    }

    try {
      await deleteUserMessage(messageId);
      setUserMessages(prev => prev.filter(msg => msg.id !== messageId));
      setMessage({ type: 'success', text: 'Tin nhắn đã được xóa thành công!' });
    } catch (error) {
      console.error('Error deleting message:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa tin nhắn. Vui lòng thử lại.' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddressFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddressFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChangePassword = async () => {
    setPasswordErrors({});
    
    // Validation
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsSaving(true);
    setMessage(null);
    
    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        setPasswordErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
        return;
      }
      
      // Update password
      await updatePassword(passwordData.newPassword);
      
      // Reset form and show success
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setMessage({ type: 'success', text: 'Mật khẩu đã được cập nhật thành công!' });
      
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUserProfile(formData);
      await refreshProfile();
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Thông tin cá nhân đã được cập nhật thành công!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!addressFormData.full_name || !addressFormData.phone || !addressFormData.address || !addressFormData.city || !addressFormData.ward) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin địa chỉ.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveUserAddress(addressFormData);
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressFormData({
        label: 'Nhà riêng',
        full_name: '',
        phone: '',
        address: '',
        city: '',
        ward: '',
        is_default: false
      });
      setMessage({ type: 'success', text: 'Địa chỉ đã được lưu thành công!' });
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      ward: address.ward,
      is_default: address.is_default
    });
    setShowAddressForm(true);
  };

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'addresses', label: 'Địa chỉ giao hàng', icon: MapPin },
    { id: 'loyalty', label: 'Điểm thưởng', icon: Settings },
    { id: 'preferences', label: 'Tùy chọn', icon: Settings },
    { id: 'messages', label: 'Tin nhắn của tôi', icon: MessageSquare }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem thông tin cá nhân</p>
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
            to="/"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {profile?.full_name || 'Người dùng'}
              </h1>
              <p className="text-green-100">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blackmores-teal text-blackmores-teal'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 text-blackmores-teal hover:text-blackmores-teal-dark transition-all duration-300 hover:scale-105 px-3 py-1 rounded-lg hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                        isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                      <option value="prefer_not_to_say">Không muốn tiết lộ</option>
                    </select>
                  </div>
                </div>

                {/* Marketing Consent */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="marketing_consent"
                      checked={formData.marketing_consent}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-4 h-4 text-blackmores-teal border-gray-300 rounded focus:ring-blackmores-teal"
                    />
                    <label className="text-sm text-gray-700">
                      Tôi đồng ý nhận thông tin khuyến mãi và tin tức từ Blackmores qua email
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center space-x-2 bg-blackmores-teal text-white px-6 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddress(null);
                      setAddressFormData({
                        label: 'Nhà riêng',
                        full_name: profile?.full_name || '',
                        phone: profile?.phone || '',
                        address: '',
                        city: '',
                        ward: '',
                        is_default: addresses.length === 0
                      });
                    }}
                    className="flex items-center space-x-2 bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>

                {/* Address List */}
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{address.label}</span>
                            {address.is_default && (
                              <span className="bg-blackmores-teal text-white px-2 py-1 rounded text-xs font-medium">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 font-medium">{address.full_name}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">
                            {address.address}, {address.ward}, {address.city}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-blackmores-teal hover:text-blackmores-teal-dark transition-colors p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 transition-colors p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Chưa có địa chỉ giao hàng nào</p>
                      <p className="text-sm">Thêm địa chỉ để thuận tiện cho việc đặt hàng</p>
                    </div>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nhãn địa chỉ
                        </label>
                        <select
                          name="label"
                          value={addressFormData.label}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                        >
                          <option value="Nhà riêng">Nhà riêng</option>
                          <option value="Văn phòng">Văn phòng</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={addressFormData.full_name}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={addressFormData.phone}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ cụ thể *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={addressFormData.address}
                          onChange={handleAddressInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal"
                          placeholder="Số nhà, tên đường"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố *
                        </label>
                        <SearchableSelect
                          options={provinces}
                          value={addressFormData.city}
                          onChange={(value) => handleAddressInputChange({ target: { name: 'city', value } } as any)}
                          placeholder="Chọn tỉnh/thành phố"
                          name="city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường/Xã *
                        </label>
                        <SearchableSelect
                          options={wards}
                          value={addressFormData.ward}
                          onChange={(value) => handleAddressInputChange({ target: { name: 'ward', value } } as any)}
                          placeholder="Chọn phường/xã"
                          name="ward"
                          disabled={!addressFormData.city}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="is_default"
                          checked={addressFormData.is_default}
                          onChange={handleAddressInputChange}
                          className="w-4 h-4 text-blackmores-teal border-gray-300 rounded focus:ring-blackmores-teal"
                        />
                        <label className="text-sm text-gray-700">
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveAddress}
                        disabled={isSaving}
                        className="flex items-center space-x-2 bg-blackmores-teal text-white px-6 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Đang lưu...' : 'Lưu địa chỉ'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loyalty Points Tab */}
            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Điểm thưởng</h2>
                  <Link
                    to="/loyalty"
                    className="bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
                  >
                    Đổi mã thưởng
                  </Link>
                </div>

                {loadingLoyalty ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải điểm thưởng...</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg p-6 border border-purple-200">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600 mb-2">
                        {loyaltyPoints.total_points.toLocaleString('vi-VN')} điểm
                      </div>
                      <p className="text-gray-600">Tổng điểm thưởng của bạn</p>
                      {loyaltyPoints.last_updated_at && (
                        <p className="text-gray-500 text-sm mt-2">
                          Cập nhật: {new Date(loyaltyPoints.last_updated_at).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-gray-600">Đồng</div>
                        <div className="text-xs text-gray-500">0-499 điểm</div>
                        <div className="text-xs text-green-600 mt-1">Giảm 5%</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-orange-600">Bạc</div>
                        <div className="text-xs text-gray-500">500-999 điểm</div>
                        <div className="text-xs text-green-600 mt-1">Giảm 10%</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">Vàng</div>
                        <div className="text-xs text-gray-500">1000-1999 điểm</div>
                        <div className="text-xs text-green-600 mt-1">Giảm 15%</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-purple-600">Kim cương</div>
                        <div className="text-xs text-gray-500">2000+ điểm</div>
                        <div className="text-xs text-green-600 mt-1">Giảm 20%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Tùy chọn tài khoản</h2>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Thông báo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Email khuyến mãi</p>
                          <p className="text-sm text-gray-500">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="marketing_consent"
                            checked={formData.marketing_consent}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blackmores-teal/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blackmores-teal"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Bảo mật</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-700">Đổi mật khẩu</p>
                            <p className="text-sm text-gray-500">Cập nhật mật khẩu tài khoản của bạn</p>
                          </div>
                          <Edit className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                      
                      {/* Password Change Form */}
                      {showPasswordForm && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                          <h4 className="font-medium text-gray-900">Thay đổi mật khẩu</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu hiện tại *
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                                passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Nhập mật khẩu hiện tại"
                            />
                            {passwordErrors.currentPassword && (
                              <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Mật khẩu mới *
                            </label>
                            <input
                              type="password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                                passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            />
                            {passwordErrors.newPassword && (
                              <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Xác nhận mật khẩu mới *
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordInputChange}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blackmores-teal focus:border-transparent ${
                                passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Nhập lại mật khẩu mới"
                            />
                            {passwordErrors.confirmPassword && (
                              <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                            )}
                          </div>

                          <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                setPasswordErrors({});
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={isSaving}
                              className="flex items-center space-x-2 bg-blackmores-teal text-white px-6 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              <span>{isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center space-x-2 bg-blackmores-teal text-white px-6 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu tùy chọn'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Tin nhắn của tôi</h2>
                  <span className="text-sm text-gray-500">
                    {userMessages.length} tin nhắn
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải tin nhắn...</p>
                  </div>
                ) : userMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>Bạn chưa có tin nhắn nào</p>
                    <p className="text-sm">Hãy chia sẻ đánh giá về các sản phẩm bạn đã sử dụng</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userMessages.map((message) => (
                      <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {message.products && (
                              <div className="flex items-center space-x-3 mb-3">
                                <img
                                  src={message.products.image}
                                  alt={message.products.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {message.products.name}
                                  </p>
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      message.message_type === 'text' ? 'bg-gray-100 text-gray-700' :
                                      message.message_type === 'image' ? 'bg-blue-100 text-blue-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {message.message_type === 'text' ? 'Văn bản' :
                                       message.message_type === 'image' ? 'Hình ảnh' : 'Video'}
                                    </span>
                                    {message.rating && (
                                      <div className="flex items-center space-x-1">
                                        {Array.from({ length: message.rating }, (_, i) => (
                                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <p className="text-gray-700 mb-2">{message.content}</p>
                            
                            {message.media_url && (
                              <div className="mb-2">
                                {message.message_type === 'image' ? (
                                  <img
                                    src={message.media_url}
                                    alt="Message attachment"
                                    className="w-24 h-24 object-cover rounded"
                                  />
                                ) : (
                                  <video
                                    src={message.media_url}
                                    poster={message.media_thumbnail || undefined}
                                    className="w-24 h-24 object-cover rounded"
                                  />
                                )}
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-700 transition-colors p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;