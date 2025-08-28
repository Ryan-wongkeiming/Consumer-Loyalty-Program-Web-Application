import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, ExternalLink } from 'lucide-react';

const TermsOfUsePage: React.FC = () => {
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
            <FileText className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Hướng dẫn và quy định sử dụng trang web Blackmores
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
                  Chào mừng bạn đến với trang web của Blackmores. Khi tiếp tục truy cập hoặc sử dụng bất kỳ nội dung, dịch vụ hay tính năng nào trên trang này, bạn đã chấp thuận tuân thủ các điều khoản dưới đây. Vui lòng đọc kỹ trước khi tiếp tục.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">1. Quyền Sở Hữu Nội Dung</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Mọi văn bản, hình ảnh, video, biểu tượng, thiết kế và nhãn hiệu trên trang web đều thuộc quyền sở hữu của Blackmores hoặc bên thứ ba được cấp phép. Bạn chỉ được xem, in hoặc tải về cho mục đích cá nhân và phi thương mại; mọi hành vi sao chép, sửa đổi, phân phối hoặc khai thác thương mại cần có sự đồng ý bằng văn bản của chúng tôi.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">2. Cách Bạn Được Phép Sử Dụng Trang Web</h2>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Không được sử dụng trang web cho mục đích trái pháp luật, lừa đảo, quấy rối hay gây tổn hại cho người khác.</li>
                  <li>Không được can thiệp vào hoạt động bảo mật, thử phá hoặc làm gián đoạn máy chủ.</li>
                  <li>Không thu thập dữ liệu hàng loạt (scraping, crawling) nếu chưa có phép.</li>
                  <li>Khi gửi bình luận hoặc nội dung, bạn đảm bảo đó là thông tin chính xác, không vi phạm quyền sở hữu trí tuệ hay quyền riêng tư của bất kỳ ai.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">3. Tài Khoản Người Dùng</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập. Mọi hoạt động diễn ra dưới tài khoản của bạn được xem là do chính bạn thực hiện. Nếu nghi ngờ tài khoản bị truy cập trái phép, hãy thông báo cho chúng tôi ngay để được hỗ trợ.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">4. Miễn Trừ Trách Nhiệm</h2>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
                  <p className="text-gray-700 leading-relaxed">
                    Thông tin sức khỏe trên trang web chỉ dành cho mục đích tham khảo, không thay thế lời khuyên y tế chuyên nghiệp. Blackmores không chịu trách nhiệm về bất kỳ quyết định điều trị, thay đổi thuốc hoặc chế độ nào dựa trên nội dung tại đây. Luôn tham khảo ý kiến bác sĩ trước khi áp dụng.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">5. Giới Hạn Trách Nhiệm Pháp Lý</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Trong phạm vi pháp luật cho phép, Blackmores không chịu trách nhiệm cho mọi tổn thất gián tiếp, đặc biệt, ngẫu nhiên hoặc hậu quả phát sinh từ việc truy cập hay sử dụng trang web, kể cả khi đã được cảnh báo về khả năng xảy ra thiệt hại.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <ExternalLink className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">6. Liên Kết Đến Trang Khác</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Trang web có thể chứa liên kết đến bên thứ ba. Những trang đó hoạt động độc lập, Blackmores không kiểm soát và không chịu trách nhiệm về nội dung hoặc chính sách bảo mật của họ.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">7. Sửa Đổi Điều Khoản</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Blackmores có quyền cập nhật Điều Khoản bất kỳ lúc nào. Thay đổi có hiệu lực ngay khi được đăng. Việc bạn tiếp tục sử dụng sau khi điều khoản mới xuất bản đồng nghĩa bạn đồng ý với các cập nhật đó.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Liên Hệ</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Nếu bạn có bất kỳ câu hỏi nào về Điều Khoản Sử Dụng này, vui lòng liên hệ với chúng tôi tại:
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

export default TermsOfUsePage;