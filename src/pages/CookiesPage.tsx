import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, Shield, BarChart3, Target, Globe } from 'lucide-react';

const CookiesPage: React.FC = () => {
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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Cookie className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Chính Sách Cookie
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Cách chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Chúng tôi sử dụng cookie để trang web hoạt động ổn định, cá nhân hóa trải nghiệm và cải thiện dịch vụ. Khi truy cập trang web, bạn đồng ý để chúng tôi lưu trữ và truy cập cookie trên thiết bị của bạn như mô tả dưới đây.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Cookie className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">1. Cookie Là Gì?</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Cookie là tệp văn bản nhỏ được lưu trên trình duyệt của bạn khi bạn ghé thăm một trang web. Cookie giúp ghi nhớ tùy chỉnh của bạn, chẳng hạn ngôn ngữ ưu tiên, và thu thập dữ liệu thống kê ẩn danh nhằm tối ưu hiệu năng.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">2. Chúng Tôi Dùng Những Loại Cookie Nào?</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-blackmores-teal text-white">
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Loại cookie</th>
                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Mục đích sử dụng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Cookie thiết yếu</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          Bảo đảm trang web chạy đúng chức năng, ví dụ nhớ phiên đăng nhập.
                        </td>
                      </tr>
                      <tr className="bg-gray-50 hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Cookie phân tích</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          Thu thập dữ liệu ẩn danh về cách người dùng tương tác để cải thiện tốc độ, giao diện.
                        </td>
                      </tr>
                      <tr className="bg-white hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">Cookie cá nhân hóa</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          Ghi nhớ sở thích (ngôn ngữ, khu vực) giúp nội dung phù hợp hơn.
                        </td>
                      </tr>
                      <tr className="bg-gray-50 hover:bg-gray-100">
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">Cookie tiếp thị</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          Hỗ trợ quảng cáo hiển thị đúng người, đúng nhu cầu; có thể đến từ đối tác quảng cáo của chúng tôi.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">3. Quản Lý Cookie Của Bạn</h2>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Bạn có thể:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Điều chỉnh cài đặt trình duyệt để chặn hoặc xóa cookie.</li>
                    <li>Sử dụng chế độ duyệt web riêng tư.</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    <strong>Lưu ý:</strong> Tắt cookie thiết yếu có thể làm một số tính năng không hoạt động đúng.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">4. Cookie Từ Bên Thứ Ba</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Một số trang hoặc nội dung nhúng (ví dụ video, bản đồ) có thể dùng cookie của bên thứ ba. Chúng tôi khuyên bạn xem chính sách cookie của các bên đó để hiểu rõ cách họ xử lý dữ liệu.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">5. Thay Đổi Chính Sách Cookie</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Chúng tôi có thể cập nhật chính sách này nhằm phản ánh thay đổi trong công nghệ hoặc quy định. Khi có sửa đổi quan trọng, bạn sẽ được thông báo rõ ràng trên trang web.
                </p>
              </section>

              <section>
                <div className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white rounded-lg p-6">
                  <p className="text-lg leading-relaxed">
                    Bằng việc duy trì kết nối với Blackmores, bạn giúp chúng tôi phục vụ tốt hơn và an tâm về cách dữ liệu của mình được bảo vệ. Nếu còn câu hỏi, đừng ngần ngại liên hệ chúng tôi qua mục "Liên Hệ" để được hỗ trợ.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Liên Hệ</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Nếu bạn có bất kỳ câu hỏi nào về Chính Sách Cookie này, vui lòng liên hệ với chúng tôi tại:
                  </p>
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p><strong>Email:</strong> info@blackmores.com</p>
                    <p><strong>Phone:</strong> 1800 803 760</p>
                    <p><strong>Địa chỉ:</strong> 20 Jubilee Ave, Warriewood NSW 2102, Australia</p>
                  </div>
                </div>
              </section>

              <section>
                <p className="text-gray-600 text-sm">
                  <strong>Cập nhật lần cuối:</strong> Tháng 1 năm 2025
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;