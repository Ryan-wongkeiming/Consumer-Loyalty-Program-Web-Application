import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CreditCard, CalendarDays, Pause, RefreshCw, AlertCircle } from 'lucide-react';

const SubscriptionFAQsPage: React.FC = () => {
  const faqs = [
    {
      icon: RefreshCw,
      q: 'Đăng ký & Tiết kiệm hoạt động như thế nào?',
      a: 'Khi bạn chọn một sản phẩm và bật "Đăng ký & Tiết kiệm", bạn được giảm 30% (sữa công thức giảm 20%) và miễn phí vận chuyển. Trước mỗi lần giao hàng, chúng tôi sẽ liên hệ với bạn (qua WhatsApp/SMS/email) để xác nhận đơn hàng tiếp theo. Việc xác nhận được thực hiện theo từng chu kỳ — không có tự động trừ tiền, không có cam kết ẩn.',
    },
    {
      icon: CreditCard,
      q: 'Tôi thanh toán như thế nào?',
      a: 'Bạn thanh toán khi nhận hàng (COD) hoặc chuyển khoản thủ công. Đơn đầu tiên được thanh toán như bình thường. Mỗi chu kỳ được xác nhận, bạn nhận hóa đơn với mức giảm 30% như nhau và thanh toán khi nhận hàng. Chúng tôi không lưu trữ thông tin thẻ tín dụng và không có tự động trừ tiền.',
    },
    {
      icon: CalendarDays,
      q: 'Tôi có thể chọn tần suất nào?',
      a: 'Bạn có thể chọn giao hàng mỗi 4, 8 hoặc 12 tuần. Giá là như nhau (-30% hoặc -20% cho sữa công thức) ở mọi tần suất — tần suất chỉ là lựa chọn về thời gian, không phải lựa chọn về giá. Tần suất 4 tuần là phổ biến nhất và được chọn mặc định.',
    },
    {
      icon: Pause,
      q: 'Tôi có thể tạm dừng hoặc bỏ qua một lần giao hàng không?',
      a: 'Có. Trong mục "Đăng ký" của tài khoản, bạn có thể tạm dừng, bỏ qua (bỏ lần giao hàng tiếp theo) hoặc thay đổi tần suất bất cứ lúc nào, không bị phạt. Bạn cũng có thể hủy hoàn toàn bất cứ lúc nào — không có thời hạn tối thiểu.',
    },
    {
      icon: AlertCircle,
      q: 'Điều gì xảy ra nếu tôi không xác nhận đơn giao hàng?',
      a: 'Nếu bạn không xác nhận trong 3 ngày (2 lần nhắc qua WhatsApp + 1 SMS), chu kỳ đó sẽ được bỏ qua và bạn nhận được thông báo. Chúng tôi không tự động trừ tiền hoặc tự động giao hàng khi chưa có xác nhận. Trong trường hợp hết hàng, việc giao hàng sẽ tạm dừng và bạn được thông báo.',
    },
    {
      icon: RefreshCw,
      q: 'Tôi có thể hủy bất cứ lúc nào không?',
      a: 'Có, không bị phạt và không có thời hạn tối thiểu. Bạn hủy trong mục "Đăng ký" của tài khoản. Nếu giá sản phẩm trong đăng ký thay đổi, bạn sẽ nhận thông báo trước ít nhất 14 ngày và có thể hủy mà không bị phạt trước khi thay đổi có hiệu lực.',
    },
    {
      icon: CreditCard,
      q: 'Tôi có thể dùng mã khuyến mãi cho đăng ký không?',
      a: 'Không. Mã khuyến mãi không áp dụng cho đơn hàng đăng ký — thay vào đó, bạn được giảm 30% (sữa công thức 20%) + miễn phí vận chuyển cho mỗi đơn hàng đăng ký, đây là ưu đãi tốt hơn.',
    },
    {
      icon: HelpCircle,
      q: 'Tôi quản lý các đăng ký của mình như thế nào?',
      a: 'Đăng nhập vào tài khoản, vào mục "Đăng ký" và bạn có thể: thay đổi tần suất, thay đổi địa chỉ, bỏ qua, tạm dừng hoặc hủy. Mỗi đăng ký hiển thị ngày giao hàng tiếp theo và trạng thái hiện tại.',
    },
  ];

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
            <HelpCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Đăng ký — FAQ</h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Tất cả các câu hỏi về Đăng ký &amp; Tiết kiệm
          </p>
        </div>
      </div>

      {/* FAQ list */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          {faqs.map(({ icon: Icon, q, a }) => (
            <div key={q} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-carehub-teal/10 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-carehub-teal" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{q}</h3>
                  <p className="text-gray-700 leading-relaxed mt-2">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-green-50 rounded-xl p-6">
          <p className="font-medium text-gray-900 mb-2">Bạn còn câu hỏi khác?</p>
          <p className="text-sm text-gray-700">
            Liên hệ với chúng tôi: WhatsApp / email / điện thoại. Chúng tôi sẽ trả lời trong 1–2 ngày làm việc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionFAQsPage;