import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, AlertCircle } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
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
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Sự riêng tư và bảo vệ dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Chúng Tôi Cam Kết Bảo Vệ Thông Tin Của Bạn Tại Blackmores
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Tại Blackmores, chúng tôi luôn đặt sự riêng tư của bạn lên hàng đầu. Hệ thống bảo mật của chúng tôi được xây dựng vững chắc để đảm bảo mọi thứ đều tuân thủ nghiêm ngặt các quy định liên quan. Điều này bao gồm cam kết mạnh mẽ từ chúng tôi, cách tiếp cận rõ ràng về bảo mật mà bạn sẽ thấy trong tài liệu này, các tài nguyên công nghệ và dịch vụ chuyên dụng, cùng với đội ngũ nhân viên được đào tạo bài bản để xử lý mọi việc một cách chuyên nghiệp.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Cách Chúng Tôi Thu Thập Thông Tin Cá Nhân Của Bạn</h2>
                </div>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Tùy vào cách bạn tương tác với Blackmores, chúng tôi có thể cần thu thập một số thông tin cá nhân như tên, chi tiết liên lạc, hoặc thậm chí là tuổi tác và tình trạng sức khỏe của bạn. Chúng tôi chỉ làm điều này khi bạn liên hệ với chúng tôi, hoặc khi chúng tôi yêu cầu và bạn (hoặc ai đó được bạn ủy quyền) cung cấp.
                  </p>
                  <p>
                    Nếu bạn cảm thấy không thoải mái khi chia sẻ những thông tin này, chúng tôi hoàn toàn hiểu. Tuy nhiên, điều đó có thể khiến chúng tôi không thể hỗ trợ bạn đầy đủ, như cung cấp dịch vụ hoặc hoạt động mà bạn mong đợi. Chúng tôi luôn cố gắng sử dụng dữ liệu ẩn danh càng nhiều càng tốt, bằng cách loại bỏ thông tin cá nhân khỏi hồ sơ khi có thể.
                  </p>
                  <p>
                    Bên cạnh đó, chúng tôi tuân thủ không chỉ luật bảo mật mà còn các quy định khác liên quan đến sản phẩm của mình. Chúng tôi cũng sử dụng công nghệ để thu thập dữ liệu chung (có thể bao gồm hoặc không thông tin cá nhân), chẳng hạn như khi thiết bị của bạn truy cập nội dung của chúng tôi. Những công cụ này, từ các dịch vụ tìm kiếm và đối tác khác, giúp chúng tôi cải thiện sản phẩm để phù hợp hơn với nhu cầu của bạn. Bạn có thể điều chỉnh sở thích của mình qua các tính năng mà công cụ tìm kiếm cung cấp.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <FileText className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Chúng Tôi Sử Dụng Thông Tin Của Bạn Như Thế Nào</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Chúng tôi sử dụng thông tin cá nhân của bạn chủ yếu để hỗ trợ hoạt động kinh doanh và không ngừng cải thiện, nhằm mang lại giá trị tốt nhất cho bạn. Ví dụ:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Cung cấp thông tin chi tiết về sản phẩm và dịch vụ, đồng thời xử lý mọi câu hỏi hay khiếu nại từ bạn.</li>
                  <li>Chia sẻ kiến thức với các chuyên gia y tế về cách sản phẩm của chúng tôi có thể hỗ trợ công chúng mà họ tư vấn.</li>
                  <li>Quản lý các chương trình và diễn đàn trực tuyến nơi bạn có thể chia sẻ câu chuyện cá nhân một cách an toàn và công khai, theo đúng các điều khoản chúng tôi đặt ra.</li>
                  <li>Gửi đến bạn các bản tin, thông báo, khảo sát, lời mời tham gia, hoặc ưu đãi về sản phẩm mới – và tất nhiên, bạn luôn có cách để từ chối nếu không quan tâm.</li>
                  <li>Tổ chức và quản lý các chương trình khuyến mãi hay cuộc thi.</li>
                  <li>Kiểm tra xem bạn có đủ điều kiện tham gia một số sản phẩm, dịch vụ hoặc chương trình đặc biệt không.</li>
                  <li>Xử lý mối quan hệ kinh doanh hoặc chuyên môn mà chúng tôi có với bạn.</li>
                  <li>Xem xét đơn xin việc nếu bạn ứng tuyển vào Blackmores.</li>
                  <li>Đánh giá và nghiên cứu để nâng cao chất lượng sản phẩm, dịch vụ.</li>
                  <li>Cập nhật hồ sơ để loại bỏ thông tin cá nhân khi bạn yêu cầu.</li>
                  <li>Và những công việc hàng ngày khác liên quan đến việc sử dụng thông tin một cách hợp lý.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Chúng tôi luôn nỗ lực để mọi thứ minh bạch và tôn trọng quyền riêng tư của bạn.
                </p>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Bảo Mật Dữ Liệu</h2>
                </div>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Chúng tôi thực hiện các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn khỏi việc truy cập, thay đổi, tiết lộ hoặc phá hủy trái phép.
                  </p>
                  <p>
                    Các biện pháp bảo mật của chúng tôi bao gồm:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Truyền dữ liệu an toàn sử dụng mã hóa HTTPS</li>
                    <li>Các tính năng bảo mật tích hợp của Supabase và chính sách bảo mật cấp hàng</li>
                    <li>Kiểm tra bảo mật và cập nhật thường xuyên</li>
                    <li>Kiểm soát truy cập và cơ chế xác thực</li>
                    <li>Quy trình sao lưu và khôi phục dữ liệu</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Quyền Của Bạn</h2>
                </div>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Bạn có quyền:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Truy cập thông tin cá nhân của bạn</li>
                    <li>Sửa chữa dữ liệu không chính xác hoặc không đầy đủ</li>
                    <li>Yêu cầu xóa thông tin cá nhân của bạn</li>
                    <li>Phản đối việc xử lý thông tin cá nhân của bạn</li>
                    <li>Yêu cầu chuyển giao dữ liệu</li>
                    <li>Rút lại sự đồng ý khi việc xử lý dựa trên sự đồng ý</li>
                  </ul>
                  <p>
                    Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi bằng thông tin được cung cấp bên dưới.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Liên Hệ</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này hoặc các hoạt động xử lý dữ liệu của chúng tôi, 
                    vui lòng liên hệ với chúng tôi tại:
                  </p>
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p><strong>Email:</strong> privacy@blackmores.com</p>
                    <p><strong>Phone:</strong> 1800 803 760</p>
                    <p><strong>Địa chỉ:</strong> 20 Jubilee Ave, Warriewood NSW 2102, Australia</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cập Nhật Chính Sách</h2>
                <p className="text-gray-700 leading-relaxed">
                  Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh những thay đổi trong 
                  hoạt động của chúng tôi hoặc luật pháp áp dụng. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi 
                  quan trọng nào bằng cách đăng chính sách cập nhật trên trang web của chúng tôi và cập nhật ngày có hiệu lực.
                </p>
                <p className="text-gray-600 text-sm mt-4">
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

export default PrivacyPolicyPage;