import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, AlertTriangle, Users, Shield } from 'lucide-react';

const EditorialPolicyPage: React.FC = () => {
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
            <MessageSquare className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Chính Sách Biên Tập
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Hướng dẫn cho các tương tác cộng đồng tôn trọng và tích cực
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Hướng Dẫn Chia Sẻ Nội Dung Trên Nền Tảng Của Blackmores</h2>
                </div>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Chúng tôi muốn bạn cảm thấy thoải mái khi chia sẻ về sức khỏe hay các mối quan tâm cá nhân trên trang web của mình. Hãy luôn chân thành và cởi mở – đó là cách chúng ta xây dựng cộng đồng hỗ trợ lẫn nhau. Nhưng nếu nội dung của bạn chứa ngôn ngữ không phù hợp, hoặc đề cập đến mối đe dọa nghiêm trọng về bệnh tật hay tổn hại thể chất (cho bản thân hoặc người khác), chúng tôi sẽ phải chỉnh sửa hoặc xóa ngay để giữ an toàn cho mọi người.
                  </p>
                  <p>
                    Nếu bạn đang gặp tình huống khẩn cấp về y tế, hãy liên hệ ngay với chuyên gia – đừng chần chừ. Dưới đây là một số liên kết hữu ích để hỗ trợ:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Lifeline: <a href="http://www.lifeline.org.au" className="text-blackmores-teal hover:underline">http://www.lifeline.org.au</a></li>
                    <li>Kids Helpline: <a href="http://www.kidshelp.com.au" className="text-blackmores-teal hover:underline">http://www.kidshelp.com.au</a></li>
                    <li>Australian Government Crisis Support: <a href="http://www.aifs.gov.au/acssa/crisis.html" className="text-blackmores-teal hover:underline">http://www.aifs.gov.au/acssa/crisis.html</a></li>
                    <li>Samaritans Crisis Line: <a href="http://www.thesamaritans.org.au" className="text-blackmores-teal hover:underline">http://www.thesamaritans.org.au</a></li>
                    <li>Relationships Australia: <a href="http://www.relationships.com.au/resources/crisis-telephone-numbers" className="text-blackmores-teal hover:underline">http://www.relationships.com.au/resources/crisis-telephone-numbers</a></li>
                  </ul>
                  <p>
                    Để giữ cho không gian của chúng ta luôn tích cực và thân thiện, hãy cùng nhau tuân thủ những nguyên tắc đơn giản này cho mọi loại nội dung bạn đăng, từ văn bản, liên kết, hình ảnh đến video.
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Những Điều Nên Làm</h2>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Hãy nhớ rằng mọi thứ bạn chia sẻ đều công khai, ai cũng có thể xem trên internet.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Tôn trọng ý kiến của mọi người xung quanh.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Giữ nội dung liên quan đến chủ đề; nếu muốn nói về chuyện khác, hãy chuyển sang nhóm phù hợp.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Giữ tâm trí rộng mở, vì mỗi người có hoàn cảnh riêng.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Hành xử một cách đạo đức và lịch sự.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Khi thảo luận về chủ đề nhạy cảm, hãy khéo léo và xem xét cảm xúc của người khác.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Luôn khách quan, cung cấp thông tin hữu ích và nhìn nhận từ nhiều góc độ.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Sử dụng ngôn ngữ sạch sẽ, tránh chửi thề, thô tục hay ám chỉ không hay.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Những Điều Không Nên Làm</h2>
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Đừng đe dọa hoặc làm phiền người khác.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Tránh nói dối về bản thân, trình độ hay chi tiết cá nhân.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Không liên kết hoặc thảo luận về nội dung xúc phạm, phản cảm.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Tránh đăng bài với mục đích quảng cáo hay thương mại.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Đừng chia sẻ nội dung không phải của bạn.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Không tham gia hay khuyến khích hoạt động bất hợp pháp.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Tránh tiết lộ thông tin cá nhân của người khác mà không có sự đồng ý.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Đừng đưa ra tuyên bố suông – hãy dùng sự kiện hoặc bằng chứng để hỗ trợ.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Không dùng lời lẽ thô tục nhắm vào ai đó, tổ chức hay bất kỳ bên nào.</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Tránh khởi xướng tranh cãi hay gây gổ với thành viên khác.</span>
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Lưu Ý Quan Trọng</h2>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Không phải mọi chia sẻ đều chính xác hay phù hợp với tình huống của bạn, và chúng không thay thế cho lời khuyên y tế chuyên nghiệp. Nếu cần hỗ trợ ngay, hãy liên hệ với bác sĩ hoặc chuyên gia sức khỏe.
                    </p>
                    <p>
                      Quản trị viên của chúng tôi có thể cần chỉnh sửa hoặc xóa nội dung nếu nó chứa từ ngữ không phù hợp, hoặc đề cập đến bệnh tật nghiêm trọng như ung thư, tiểu đường, bệnh tim... Chúng tôi cũng giữ quyền loại bỏ bất kỳ nội dung nào không phù hợp để bảo vệ cộng đồng. Nếu vi phạm lặp lại, bạn có thể nhận cảnh cáo, bị đình chỉ tạm thời hoặc hủy tài khoản, cùng với nội dung liên quan.
                    </p>
                    <p>
                      Các nhóm thảo luận vi phạm cũng có thể bị chỉnh sửa hoặc xóa mà không cần báo trước. Nếu bạn thấy nội dung nào không ổn, hãy báo cho chúng tôi qua email [email protected] – chúng tôi đánh giá cao sự giúp đỡ của bạn để cùng xây dựng một cộng đồng tốt đẹp hơn.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-6 h-6 text-blackmores-teal" />
                  <h2 className="text-2xl font-bold text-gray-900">Kiểm Duyệt và Thực Thi</h2>
                </div>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Đội ngũ kiểm duyệt của chúng tôi xem xét nội dung được báo cáo và thực hiện hành động phù hợp dựa trên các hướng dẫn này. 
                    Các hành động có thể bao gồm:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Chỉnh sửa hoặc xóa nội dung</li>
                    <li>Gửi tin nhắn cảnh báo cho người dùng</li>
                    <li>Đình chỉ tài khoản tạm thời</li>
                    <li>Vô hiệu hóa tài khoản vĩnh viễn đối với các vi phạm nghiêm trọng hoặc lặp lại</li>
                  </ul>
                  <p>
                    Chúng tôi cố gắng công bằng và nhất quán trong việc thực thi đồng thời duy trì một môi trường 
                    an toàn và thân thiện cho tất cả người dùng.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Vi Phạm</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Nếu bạn gặp nội dung vi phạm các hướng dẫn này, vui lòng báo cáo bằng cách:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Sử dụng các công cụ báo cáo trong ứng dụng</li>
                    <li>Email: support@blackmores.com</li>
                    <li>Biểu mẫu liên hệ trên trang web của chúng tôi</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Vui lòng cung cấp càng nhiều chi tiết càng tốt khi báo cáo vi phạm để giúp chúng tôi 
                    điều tra và thực hiện hành động phù hợp.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cập Nhật Chính Sách</h2>
                <p className="text-gray-700 leading-relaxed">
                  Chúng tôi có thể cập nhật Chính sách Biên tập này theo thời gian để phản ánh những thay đổi trong 
                  tiêu chuẩn cộng đồng hoặc tính năng nền tảng của chúng tôi. Chúng tôi sẽ thông báo cho người dùng 
                  về bất kỳ thay đổi quan trọng nào và cập nhật ngày có hiệu lực tương ứng.
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

export default EditorialPolicyPage;