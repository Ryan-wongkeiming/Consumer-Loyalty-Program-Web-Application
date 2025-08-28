import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, CheckCircle, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserAddresses, saveUserAddress } from '../lib/auth';
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

const AddressesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    setProvinces(getAllProvinces());
    if (user) {
      loadAddresses();
    }
  }, [user]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddressFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddressFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddNewAddress = () => {
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
    setShowAddressForm(true);
    setMessage(null);
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
    setMessage(null);
  };

  const handleSaveAddress = async () => {
    if (!addressFormData.full_name || !addressFormData.phone || !addressFormData.address || !addressFormData.city || !addressFormData.ward) {
      setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin địa chỉ.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('user_addresses')
          .update(addressFormData)
          .eq('id', editingAddress.id);

        if (error) throw error;
      } else {
        // Create new address
        await saveUserAddress(addressFormData);
      }

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
      setMessage({ 
        type: 'success', 
        text: editingAddress ? 'Địa chỉ đã được cập nhật thành công!' : 'Địa chỉ đã được thêm thành công!' 
      });
    } catch (error) {
      console.error('Error saving address:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu địa chỉ. Vui lòng thử lại.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      await loadAddresses();
      setMessage({ type: 'success', text: 'Địa chỉ đã được xóa thành công!' });
    } catch (error) {
      console.error('Error deleting address:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi xóa địa chỉ. Vui lòng thử lại.' });
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      // First, unset all default addresses
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      await loadAddresses();
      setMessage({ type: 'success', text: 'Địa chỉ mặc định đã được cập nhật!' });
    } catch (error) {
      console.error('Error setting default address:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật địa chỉ mặc định.' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để quản lý địa chỉ</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Địa chỉ giao hàng</h1>
                <p className="text-green-100">Quản lý địa chỉ giao hàng của bạn</p>
              </div>
            </div>
            <button
              onClick={handleAddNewAddress}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm địa chỉ</span>
            </button>
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
              <X className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Address Form */}
        {showAddressForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={(value) => handleInputChange({ target: { name: 'city', value } } as any)}
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
                  onChange={(value) => handleInputChange({ target: { name: 'ward', value } } as any)}
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
                  onChange={handleInputChange}
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
                  setMessage(null);
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

        {/* Address List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Địa chỉ đã lưu</h2>
            {!showAddressForm && (
              <button
                onClick={handleAddNewAddress}
                className="flex items-center space-x-2 bg-blackmores-teal text-white px-4 py-2 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm địa chỉ mới</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
              <p className="text-gray-500 text-lg">Đang tải địa chỉ...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
              <p className="text-gray-600 mb-6">Thêm địa chỉ để thuận tiện cho việc đặt hàng</p>
              <button
                onClick={handleAddNewAddress}
                className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
              >
                Thêm địa chỉ đầu tiên
              </button>
            </div>
          ) : (
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
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-blackmores-teal hover:text-blackmores-teal-dark transition-colors text-sm font-medium"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-blackmores-teal hover:text-blackmores-teal-dark transition-all duration-300 p-2 rounded-lg hover:bg-green-50 hover:scale-110"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-700 transition-all duration-300 p-2 rounded-lg hover:bg-red-50 hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;