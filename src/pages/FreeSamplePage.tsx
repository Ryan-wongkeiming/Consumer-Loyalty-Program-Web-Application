import React, { useState, useEffect } from 'react';
import { ArrowLeft, Gift, CheckCircle, Users, Truck, Heart, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getAllProvinces, getWardsByProvince, Province, Ward } from '../utils/locationData';
import SearchableSelect from '../components/SearchableSelect';

interface FreeSampleType {
  id: string;
  name: string;
  stock: number;
  is_active: boolean;
}

const ThankYouScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Cảm ơn bạn đã đăng ký! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Đơn đăng ký dùng thử miễn phí của bạn đã được tiếp nhận thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận và giao hàng.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Thời gian giao hàng:</strong> 3-5 ngày làm việc
          </p>
          <p className="text-sm text-gray-600">
            <strong>Sản phẩm:</strong> 2 gói CareHub Cải Tiến Mới
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Đang chuyển về trang sản phẩm...</span>
        </div>
      </div>
    </div>
  );
};

const FreeSamplePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    babyName: '',
    babyBirthDate: '',
    address: '',
    city: '',
    ward: '',
    notes: '', // Optional notes
    sampleTypeId: '', // New field for selected sample type
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [sampleTypes, setSampleTypes] = useState<FreeSampleType[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(true); // New state for loading sample types
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error messages

  // Location data state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Load provinces on component mount
  useEffect(() => {
    setProvinces(getAllProvinces());
    loadSampleTypes();
  }, []);

  // Load available sample types from Supabase
  const loadSampleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('free_samples')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error loading sample types:', error);
        setErrorMessage('Không thể tải danh sách mẫu. Vui lòng thử lại.'); // Set error message
      } else {
        setSampleTypes(data || []);
      }
    } catch (error) {
      console.error('Error loading sample types:', error);
      setErrorMessage('Có lỗi xảy ra khi tải danh sách mẫu.');
    } finally {
      setLoadingSamples(false);
    }
  };

  // Load wards when province changes
  useEffect(() => {
    if (formData.city) {
      setWards(getWardsByProvince(formData.city));
      setFormData(prev => ({ ...prev, ward: '' })); // Reset ward when province changes
    } else {
      setWards([]);
    }
  }, [formData.city]);

  const handleInputChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sampleTypeId.trim()) {
      newErrors.sampleTypeId = 'Vui lòng chọn loại mẫu';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!formData.ward.trim()) {
      newErrors.ward = 'Vui lòng chọn Phường/Xã';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show consent modal first
    setShowConsentModal(true);
  };

  const handleConsentConfirm = async () => {
    setShowConsentModal(false);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null); // Clear previous error messages

    try {
      // Call the Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-free-sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email || null,
          babyName: formData.babyName || null,
          babyBirthDate: formData.babyBirthDate || null,
          address: formData.address,
          city: formData.city,
          ward: formData.ward,
          notes: formData.notes || null,
          sampleTypeId: formData.sampleTypeId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.outOfStock) {
          setErrorMessage(result.error); // Display out of stock message
          // Refresh sample types to update stock display
          await loadSampleTypes();
        } else {
          setErrorMessage(result.error || 'Có lỗi xảy ra khi gửi yêu cầu.');
        }
        return;
      }

      // Success - show thank you screen
      setShowThankYou(true);
      
      // Auto redirect after 4 seconds
      setTimeout(() => {
        navigate('/');
      }, 4000);

    } catch (error) {
      console.error('Error submitting free sample request:', error);
      setErrorMessage('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentCancel = () => {
    setShowConsentModal(false);
  };

  // Show Thank You screen if registration is completed
  if (showThankYou) {
    return <ThankYouScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleConsentCancel}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Thông báo quan trọng
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Theo khuyến cáo của Tổ chức Y tế Thế giới (WHO), sữa mẹ là thức ăn tốt nhất cho sức khỏe và sự phát triển toàn diện của trẻ nhỏ; các yếu tố chống nhiễm khuẩn, đặc biệt là kháng thể chỉ có trong sữa mẹ có tác dụng giúp trẻ phòng, chống bệnh tiêu chảy, nhiễm khuẩn đường hô hấp và một số bệnh nhiễm khuẩn khác.
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed mt-3">
                        Nội dung bạn đang tìm kiếm là thông tin về sản phẩm từ nhà sản xuất nhằm mục đích trợ giúp người có nhu cầu tìm hiểu các thông tin chi tiết và khoa học về sản phẩm, không nhằm mục đích quảng cáo. Vì vậy, bạn vui lòng xác nhận rằng mình có nhu cầu và chủ động tìm hiểu các thông tin về các sản phẩm sau khi đã đọc và hiểu rõ khuyến cáo này; hoặc vui lòng xác nhận bạn là nhân viên y tế có nhu cầu tìm hiểu về sản phẩm.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConsentConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={handleConsentCancel}
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Quay lại trang chủ
            </Link>
            <div className="flex items-center space-x-2 text-emerald-600">
              <Gift className="w-6 h-6" />
              <span className="font-semibold">Miễn phí 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-6 animate-bounce">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full inline-block mb-4 font-bold text-lg animate-pulse">
              🔥 ƯU ĐÃI CÓ HẠN - NHANH TAY! 🔥
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trải Nghiệm CareHub
            </h1>
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-4">
              MIỄN PHÍ 100% - 2 GÓI DÙNG THỬ
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              2 gói CareHub hoàn toàn MIỄN PHÍ!
            </p>
            
            {/* Urgency Counter */}
            <div className="bg-red-600 text-white px-6 py-3 rounded-full inline-block mb-8 font-bold text-lg animate-pulse">
              ⏰ CHỈ CÒN 48 GIỜ - SỐ LƯỢNG CÓ HẠN!
            </div>
            
            {/* Social Proof */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-4 text-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">15,000+</div>
                  <div className="text-sm">Đã đăng ký</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">4.8★</div>
                  <div className="text-sm">Đánh giá</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">98%</div>
                  <div className="text-sm">Hài lòng</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
                  alt="Customer"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="text-gray-700 italic text-sm">
                    "Tôi đã thử mẫu miễn phí và thực sự ấn tượng với chất lượng. Giờ tôi là khách hàng thường xuyên!"
                  </p>
                  <p className="text-gray-500 text-xs mt-1">- Nguyễn Thị Mai, Hà Nội</p>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              ✨ Chỉ cần 2 phút đăng ký!
            </p>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hoàn toàn miễn phí</h3>
                <p className="text-gray-600 text-sm">Không mất phí vận chuyển</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Giao hàng tận nơi</h3>
                <p className="text-gray-600 text-sm">3-5 ngày giao hàng</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chăm sóc sức khỏe</h3>
                <p className="text-gray-600 text-sm">Chất lượng cao cấp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" id="registration-form">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Thông tin đăng ký</h2>
            </div>
            <p className="text-blue-100 text-center mt-2">
              Vui lòng điền đầy đủ thông tin để nhận sản phẩm dùng thử
            </p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Sample Type Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn loại mẫu</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại mẫu *
                    </label>
                    {loadingSamples ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-gray-500">Đang tải...</span>
                      </div>
                    ) : (
                      <select
                        name="sampleTypeId"
                        value={formData.sampleTypeId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.sampleTypeId ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Chọn loại mẫu</option>
                        {sampleTypes.map((sampleType) => (
                          <option 
                            key={sampleType.id}
                            value={sampleType.id}
                            disabled={sampleType.stock <= 0}
                          >
                            {sampleType.name} {sampleType.stock <= 0 ? '(Hết hàng)' : `(Còn ${sampleType.stock})`}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.sampleTypeId && (
                      <p className="text-red-500 text-sm mt-1">{errors.sampleTypeId}</p>
                    )}
                  </div>
                </div>

                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="VD: 0XXXXXXXXX"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (tùy chọn)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ email"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên của bé (tùy chọn)
                      </label>
                      <input
                        type="text"
                        name="babyName"
                        value={formData.babyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tên của bé"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh/Ngày dự sinh (tùy chọn)
                      </label>
                      <input
                        type="date"
                        name="babyBirthDate"
                        value={formData.babyBirthDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ giao hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ cụ thể *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Số nhà, tên đường"
                      />
                      {errors.address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tỉnh/Thành phố *
                        </label>
                        <SearchableSelect
                          options={provinces}
                          value={formData.city}
                          onChange={(value) => handleInputChange({ target: { name: 'city', value } })}
                          placeholder="Chọn tỉnh/thành phố"
                          error={!!errors.city}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phường/Xã *
                        </label>
                        <SearchableSelect
                          options={wards}
                          value={formData.ward}
                          onChange={(value) => handleInputChange({ target: { name: 'ward', value } })}
                          placeholder="Chọn phường/xã"
                          disabled={!formData.city}
                          error={!!errors.ward}
                        />
                        {errors.ward && (
                          <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-red-700">{errorMessage}</span>
                    </div>
                  </div>
                )}


                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || loadingSamples || !formData.sampleTypeId}
                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Đang xử lý...</span>
                      </div>
                    ) : loadingSamples ? (
                      'Đang tải loại mẫu...'
                    ) : !formData.sampleTypeId ? (
                      'Vui lòng chọn loại mẫu'
                    ) : (
                      'Đăng ký dùng thử miễn phí'
                    )}
                  </button>
                </div>

                {/* Policy Agreement */}
                <div className="text-center text-sm text-gray-600">
                  <p>
                    Bằng việc đăng ký, bạn đồng ý với{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Điều khoản sử dụng
                    </a>{' '}
                    và{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      Chính sách bảo mật
                    </a>{' '}
                    của CareHub
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn CareHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <strong>Sản phẩm:</strong> 2 gói CareHub Cải Tiến Mới
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất lượng cao cấp</h3>
              <p className="text-gray-600">
                Kiểm tra nghiêm ngặt và đảm bảo chất lượng cho mọi sản phẩm
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Công thức chuyên gia</h3>
              <p className="text-gray-600">
                Được phát triển bởi đội ngũ chuyên gia dinh dưỡng và sức khỏe
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thương hiệu uy tín</h3>
              <p className="text-gray-600">
                Thương hiệu sức khỏe tự nhiên được tin tưởng nhất Australia từ 1930
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            const formSection = document.getElementById('registration-form');
            if (formSection) {
              formSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group animate-pulse"
          title="Đăng ký ngay"
        >
          <Gift className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default FreeSamplePage;