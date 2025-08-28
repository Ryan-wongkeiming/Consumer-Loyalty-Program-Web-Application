import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Share2, Heart, Info, CheckCircle } from 'lucide-react';
import { getTopicById, getTopics, Topic } from '../data/topics';


const TopicDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = React.useState<Topic | null>(null);
  const [relatedTopics, setRelatedTopics] = React.useState<Topic[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load topic data from Supabase
  React.useEffect(() => {
    const loadTopic = async () => {
      if (!id) return;
      
      try {
        const [topicData, allTopics] = await Promise.all([
          getTopicById(id),
          getTopics()
        ]);
        
        setTopic(topicData);
        
        // Get related topics (exclude current topic)
        const related = allTopics
          .filter(t => t.id !== id)
          .slice(0, 2);
        setRelatedTopics(related);
      } catch (error) {
        console.error('Error loading topic:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopic();
  }, [id]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blackmores-teal mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Đang tải chủ đề...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chủ đề</h1>
          <p className="text-gray-600 mb-6">Chủ đề bạn đang tìm kiếm không tồn tại.</p>
          <Link
            to="/womens-health"
            className="bg-blackmores-teal text-white px-6 py-3 rounded-lg hover:bg-blackmores-teal-dark transition-colors"
          >
            Quay lại Sức khỏe phụ nữ
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blackmores-teal hover:text-blackmores-teal-dark">
              Trung tâm sức khỏe
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/womens-health" className="text-blackmores-teal hover:text-blackmores-teal-dark">
              Sức khỏe phụ nữ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Chủ đề</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/womens-health"
            className="inline-flex items-center text-blackmores-teal hover:text-blackmores-teal-dark transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Quay lại Sức khỏe phụ nữ
          </Link>
        </div>
      </div>

      {/* Topic Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Image */}
          <div className="h-64 md:h-80 overflow-hidden">
            <img
              src={topic.image}
              alt={topic.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Topic Header */}
          <div className="p-8">
            <div className="mb-4">
              <span className="text-sm text-blackmores-teal font-medium bg-green-50 px-3 py-1 rounded-full">
                {topic.category}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {topic.title}
            </h1>

            {/* Topic Meta */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blackmores-teal transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Lưu</span>
                </button>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>Chủ đề sức khỏe</span>
              </div>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tổng quan</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                {topic.overview.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph.trim()}</p>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Triệu chứng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topic.symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-blackmores-teal mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Causes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nguyên nhân</h2>
              <div className="space-y-3">
                {topic.causes.map((cause, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blackmores-teal rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{cause}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Natural Therapies */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liệu pháp tự nhiên</h2>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="space-y-3">
                  {topic.natural_therapies.map((therapy, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{therapy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Diet & Lifestyle */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Chế độ ăn uống & Lối sống</h2>
              <div className="space-y-3">
                {topic.diet_and_lifestyle.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lưu ý quan trọng</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                <div className="space-y-3">
                  {topic.important_notes.map((note, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Tuyên bố miễn trừ trách nhiệm:</strong> Thông tin này chỉ dành cho mục đích giáo dục và không nhằm thay thế lời khuyên y tế chuyên nghiệp. 
                Luôn tham khảo ý kiến của nhà cung cấp dịch vụ chăm sóc sức khỏe có trình độ trước khi thay đổi thói quen sức khỏe hoặc nếu bạn có lo ngại về các triệu chứng của mình.
              </p>
            </div>
          </div>
        </article>

        {/* Related Topics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chủ đề liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedTopics.map(relatedTopic => (
                <Link
                  key={relatedTopic.id}
                  to={`/womens-health/topic/${relatedTopic.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={relatedTopic.image}
                      alt={relatedTopic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blackmores-teal transition-colors">
                      {relatedTopic.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <Info className="w-3 h-3 mr-1" />
                      <span>Health Topic</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicDetailPage;