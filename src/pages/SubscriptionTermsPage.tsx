import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw, CreditCard, CalendarDays, AlertCircle, Shield, Users } from 'lucide-react';

const SubscriptionTermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-carehub-teal hover:text-carehub-teal-dark transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-carehub-teal to-carehub-teal-dark text-white py-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-5">
            <FileText className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Đăng ký &amp; Tiết kiệm — Điều Khoản</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Điều khoản và điều kiện của dịch vụ đăng ký CareHub
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="space-y-8">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <RefreshCw className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">1. Đăng ký hoạt động như thế nào</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Đăng ký &amp; Tiết kiệm là dịch vụ nhận giao hàng định kỳ một sản phẩm với giá ưu đãi. Bạn cần có tài khoản CareHub. Bạn chọn sản phẩm và tần suất (4/8/12 tuần); bạn được giảm 30% (sữa công thức giảm 20%) và miễn phí vận chuyển cho mỗi đơn hàng đăng ký.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CreditCard className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">2. Thanh toán và xác nhận theo từng chu kỳ</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Bạn thanh toán khi nhận hàng (COD) hoặc chuyển khoản thủ công — chúng tôi không lưu trữ thông tin thẻ và không tự động trừ tiền.</li>
                <li>Trước mỗi lần giao hàng, chúng tôi liên hệ với bạn (WhatsApp/SMS/email) để xác nhận.</li>
                <li>Không có xác nhận, lần giao hàng sẽ được bỏ qua — không tự động giao hàng, không tự động trừ tiền.</li>
                <li>Nếu không xác nhận thanh toán sau 3 ngày (2 lần nhắc + 1 SMS), đăng ký sẽ tự động tạm dừng.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CalendarDays className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">3. Tần suất, bỏ qua và tạm dừng</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Giá đăng ký là như nhau ở mọi tần suất — tần suất chỉ quyết định nhịp giao hàng, không phải giá.</li>
                <li>Bạn có thể bỏ qua một lần giao hàng, tạm dừng hoặc thay đổi tần suất bất cứ lúc nào trong mục "Đăng ký" của tài khoản.</li>
                <li>Không có thời hạn tối thiểu và không bị phạt khi hủy đăng ký.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">4. Các trường hợp đặc biệt</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Hết hàng:</strong> nếu sản phẩm trong đăng ký không có sẵn, việc giao hàng sẽ tạm dừng và bạn được thông báo — chúng tôi không tự động trừ tiền và không thay sản phẩm khi chưa có sự đồng ý của bạn.</li>
                <li><strong>Thay đổi giá:</strong> nếu giá sản phẩm trong đăng ký thay đổi, bạn nhận thông báo trước ít nhất 14 ngày; bạn có thể hủy mà không bị phạt trước ngày đó.</li>
                <li><strong>Mã khuyến mãi:</strong> không áp dụng cho đơn hàng đăng ký. Thay vào đó, bạn được giảm 30% (sữa công thức 20%) + miễn phí vận chuyển.</li>
                <li><strong>Hủy từ phía CareHub:</strong> chúng tôi có quyền hủy đăng ký khi hành động hợp lý (sản phẩm ngừng kinh doanh, vi phạm điều khoản, thanh toán thất bại nhiều lần).</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">5. Trách nhiệm của bạn</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Giữ thông tin liên hệ (email/điện thoại) luôn cập nhật để nhận xác nhận.</li>
                <li>Theo dõi ngày giao hàng và giữ địa chỉ hiện tại.</li>
                <li>Hủy hoặc thay đổi trước chu kỳ tiếp theo đã được xác nhận để không nhận giao hàng.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-carehub-teal" />
                <h2 className="text-2xl font-bold text-gray-900">6. Liên hệ và thay đổi</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                CareHub có thể thay đổi các Điều khoản này bất cứ lúc nào, với thông báo hợp lý trước đó. Việc tiếp tục đăng ký sau khi nhận thông báo đồng nghĩa với việc bạn chấp nhận các thay đổi. Nếu có thắc mắc, hãy liên hệ bộ phận chăm sóc khách hàng CareHub (WhatsApp / email / điện thoại).
              </p>
            </section>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Cập nhật lần cuối: tháng 9 năm 2026 · Mô hình xác nhận theo từng chu kỳ (COD-first)
        </p>
      </div>
    </div>
  );
};

export default SubscriptionTermsPage;