import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Users, Globe, Heart, Shield, Leaf } from 'lucide-react';

const AboutPage: React.FC = () => {
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Về Blackmores
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Hơn 90 năm tiên phong trong lĩnh vực sức khỏe tự nhiên
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Thương hiệu sức khỏe tự nhiên hàng đầu Australia
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-lg mb-6">
                Blackmores được thành lập vào năm 1930 bởi Maurice Blackmore, một nhà trị liệu tự nhiên người Australia. 
                Với niềm tin mạnh mẽ rằng cơ thể con người có khả năng tự chữa lành khi được cung cấp đầy đủ dinh dưỡng, 
                ông đã tạo ra những sản phẩm sức khỏe tự nhiên chất lượng cao.
              </p>
              <p className="text-lg mb-6">
                Ngày nay, Blackmores đã trở thành thương hiệu sức khỏe tự nhiên được tin tưởng nhất tại Australia 
                và được công nhận trên toàn thế giới. Chúng tôi cam kết cải thiện sức khỏe và hạnh phúc của mọi người 
                thông qua các sản phẩm sức khỏe tự nhiên chất lượng cao.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Giá trị cốt lõi của chúng tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blackmores-teal" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chất lượng</h3>
              <p className="text-gray-600">
                Cam kết về chất lượng cao nhất trong mọi sản phẩm, từ nguyên liệu thô đến sản phẩm hoàn thiện.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-blackmores-teal" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tự nhiên</h3>
              <p className="text-gray-600">
                Tin tưởng vào sức mạnh của thiên nhiên và sử dụng các thành phần tự nhiên tốt nhất.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blackmores-teal" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chăm sóc</h3>
              <p className="text-gray-600">
                Quan tâm đến sức khỏe và hạnh phúc của khách hàng là ưu tiên hàng đầu của chúng tôi.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Câu chuyện của chúng tôi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Maurice Blackmore - Người sáng lập</h3>
                <p className="text-gray-700 mb-4">
                  Maurice Blackmore là một nhà trị liệu tự nhiên tiên phong, người đã dành cả cuộc đời mình 
                  để nghiên cứu và phát triển các phương pháp chữa lành tự nhiên. Ông tin rằng cơ thể con người 
                  có khả năng tự chữa lành khi được cung cấp đúng dinh dưỡng.
                </p>
                <p className="text-gray-700">
                  Triết lý này đã trở thành nền tảng cho tất cả các sản phẩm Blackmores và tiếp tục 
                  hướng dẫn chúng tôi cho đến ngày hôm nay.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-3">Các mốc quan trọng:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blackmores-teal rounded-full mr-3"></div>
                    1930: Thành lập Blackmores
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blackmores-teal rounded-full mr-3"></div>
                    1985: Niêm yết trên sàn chứng khoán Australia
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blackmores-teal rounded-full mr-3"></div>
                    2000s: Mở rộng ra thị trường châu Á
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blackmores-teal rounded-full mr-3"></div>
                    2024: Có mặt tại hơn 17 quốc gia
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Cam kết của chúng tôi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-6 h-6 text-blackmores-teal mr-2" />
                  Nghiên cứu và Phát triển
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi đầu tư mạnh mẽ vào nghiên cứu khoa học để đảm bảo rằng các sản phẩm của chúng tôi 
                  được hỗ trợ bởi bằng chứng khoa học vững chắc.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 text-blackmores-teal mr-2" />
                  Cộng đồng và Giáo dục
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi cam kết giáo dục cộng đồng về lợi ích của sức khỏe tự nhiên và cung cấp 
                  thông tin đáng tin cậy về dinh dưỡng và sức khỏe.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-6 h-6 text-blackmores-teal mr-2" />
                  Bền vững và Môi trường
                </h3>
                <p className="text-gray-700 mb-4">
                  Chúng tôi cam kết bảo vệ môi trường thông qua các hoạt động sản xuất bền vững 
                  và sử dụng nguyên liệu có nguồn gốc có trách nhiệm.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-blackmores-teal mr-2" />
                  An toàn và Chất lượng
                </h3>
                <p className="text-gray-700 mb-4">
                  Mọi sản phẩm Blackmores đều trải qua quá trình kiểm tra chất lượng nghiêm ngặt 
                  để đảm bảo an toàn và hiệu quả tối đa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Presence */}
        <div className="bg-gradient-to-r from-blackmores-teal to-blackmores-teal-dark text-white rounded-2xl p-8 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              Sự hiện diện toàn cầu
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Blackmores hiện có mặt tại hơn 17 quốc gia trên thế giới, mang đến các sản phẩm 
              sức khỏe tự nhiên chất lượng cao cho hàng triệu khách hàng.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">90+</div>
                <div className="text-green-100">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">17+</div>
                <div className="text-green-100">Quốc gia</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">200+</div>
                <div className="text-green-100">Sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">#1</div>
                <div className="text-green-100">Thương hiệu tại Úc</div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Promise */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Lời hứa của chúng tôi
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Tại Blackmores, chúng tôi cam kết tiếp tục di sản của Maurice Blackmore bằng cách 
              cung cấp các sản phẩm sức khỏe tự nhiên chất lượng cao nhất. Chúng tôi tin rằng 
              sức khỏe tốt là nền tảng của một cuộc sống hạnh phúc và chúng tôi ở đây để hỗ trợ 
              bạn trên hành trình đó.
            </p>
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-blackmores-teal">
              <p className="text-blackmores-teal font-semibold text-lg">
                "Sức khỏe tự nhiên cho cuộc sống tự nhiên"
              </p>
              <p className="text-gray-600 mt-2">- Triết lý của Blackmores</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;